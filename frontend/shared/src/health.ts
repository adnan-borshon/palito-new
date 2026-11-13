import type { AnimalInput, DemoCommand, DemoState } from './types.ts';
import { assertDomain } from './errors.ts';
import { activeAnimal, actor, bilingual, findById, heldCollateral, linkedVet, nextId, notify, ownedAnimal } from './domain-context.ts';
import { hasText, isPositiveMoney, isValidDate, isoAfter } from './validation.ts';

function validateAnimal(input: AnimalInput, now: string) {
  assertDomain(hasText(input.name, 1, 80) && hasText(input.breed, 1, 100));
  assertDomain(['cattle', 'goat', 'buffalo'].includes(input.species) && ['female', 'male'].includes(input.sex));
  assertDomain(isValidDate(input.birthDate) && Date.parse(input.birthDate) <= Date.parse(now) && Date.parse(now) - Date.parse(input.birthDate) < 40 * 366 * 86_400_000);
  assertDomain(Number.isFinite(input.weightKg) && input.weightKg > 0 && input.weightKg <= 2000 && isPositiveMoney(input.value));
}

function availableSlot(state: DemoState, vetId: string, scheduledAt: string, exceptId?: string) {
  // Each sample appointment reserves a 30-minute slot.
  assertDomain(!state.appointments.some(item => item.id !== exceptId && item.vetId === vetId && ['requested', 'accepted', 'in_progress'].includes(item.status) && Math.abs(Date.parse(item.scheduledAt) - Date.parse(scheduledAt)) < 30 * 60_000), 'duplicate');
}

export function handleHealth(state: DemoState, command: DemoCommand): { id?: string } | undefined {
  switch (command.type) {
    case 'farm.save': {
      const user = actor(state, ['farmer']);
      assertDomain(hasText(command.name, 1, 100) && hasText(command.address, 3, 500) && hasText(command.district, 1, 100));
      assertDomain(Number.isFinite(command.size) && command.size > 0 && command.size <= 10000);
      let farm = state.farms.find(item => item.ownerId === user.id);
      if (!farm) { farm = { id: nextId(state, 'farm'), ownerId: user.id, name: '', district: '', address: '', size: 1 }; state.farms.push(farm); }
      Object.assign(farm, { name: command.name.trim(), district: command.district.trim(), address: command.address.trim(), size: command.size });
      return { id: farm.id };
    }
    case 'animal.add': {
      const user = actor(state, ['farmer']); validateAnimal(command.animal, state.now);
      const farm = state.farms.find(item => item.ownerId === user.id); assertDomain(farm, 'not_found');
      const id = nextId(state, 'animal');
      state.animals.push({ ...command.animal, id, ownerId: user.id, farmId: farm.id, tag: `PL-${state.revision + 1005}`, healthScore: 80, status: 'healthy', registeredAt: state.now });
      state.records.push({ id: nextId(state, 'record'), animalId: id, kind: 'registration', title: bilingual('স্বাস্থ্য পাসপোর্ট তৈরি', 'Health passport created'), note: 'ডেমো নিবন্ধন / Demo registration', createdAt: state.now });
      return { id };
    }
    case 'animal.update': {
      const animal = activeAnimal(state, command.animalId); validateAnimal({ ...animal, ...command.animal }, state.now);
      // Editable profile fields never change existing signed-off collateral valuations.
      for (const key of ['name', 'species', 'breed', 'sex', 'birthDate', 'weightKg', 'value'] as const) {
        const value = command.animal[key]; if (value !== undefined) Object.assign(animal, { [key]: value });
      }
      return { id: animal.id };
    }
    case 'animal.archive': {
      const animal = activeAnimal(state, command.animalId);
      assertDomain(!heldCollateral(state, animal.id), 'collateral');
      assertDomain(!state.policies.some(item => item.animalId === animal.id && ['active', 'submitted'].includes(item.status)), 'invalid_transition');
      assertDomain(!state.appointments.some(item => item.animalId === animal.id && ['requested', 'accepted', 'in_progress'].includes(item.status)), 'invalid_transition');
      animal.status = 'sold'; return { id: animal.id };
    }
    case 'record.add': {
      const user = actor(state); const animal = findById(state.animals, command.animalId);
      if (user.role === 'farmer') { ownedAnimal(state, animal.id); assertDomain(['registration', 'checkup'].includes(command.kind), 'unauthorized'); }
      else linkedVet(state, animal.id);
      assertDomain(animal.status !== 'sold' && animal.status !== 'deceased', 'invalid_transition');
      assertDomain(['registration', 'checkup', 'vaccination', 'treatment'].includes(command.kind));
      assertDomain(hasText(command.title.bn) && hasText(command.title.en) && hasText(command.note, 1, 2000));
      assertDomain(!command.nextDueAt || isValidDate(command.nextDueAt));
      const id = nextId(state, 'record'); state.records.push({ id, animalId: animal.id, vetId: user.role === 'vet' ? user.id : undefined, kind: command.kind, title: command.title, note: command.note, nextDueAt: command.nextDueAt, createdAt: state.now }); return { id };
    }
    case 'device.connect': {
      const animal = activeAnimal(state, command.animalId);
      assertDomain(hasText(command.serial, 3, 60) && /^[a-zA-Z0-9-]+$/.test(command.serial));
      assertDomain(!state.devices.some(item => item.serial === command.serial && item.animalId !== animal.id), 'duplicate');
      let device = state.devices.find(item => item.animalId === animal.id);
      if (device) { assertDomain(!device.connected || device.serial !== command.serial, 'duplicate'); device.connected = true; device.serial = command.serial; device.lastSeenAt = state.now; }
      else { device = { id: nextId(state, 'device'), animalId: animal.id, serial: command.serial, connected: true, battery: 100, lastSeenAt: state.now, readings: [{ at: state.now, temperature: 38.5, heartRate: 70, activity: 75 }] }; state.devices.push(device); }
      for (const alert of state.alerts.filter(item => item.animalId === animal.id && item.kind === 'disconnected' && item.status !== 'resolved')) alert.status = 'resolved';
      return { id: device.id };
    }
    case 'device.disconnect': {
      const device = findById(state.devices, command.deviceId); activeAnimal(state, device.animalId); assertDomain(device.connected, 'invalid_transition'); device.connected = false;
      const id = nextId(state, 'alert'); state.alerts.push({ id, animalId: device.animalId, kind: 'disconnected', severity: 'warning', title: bilingual('ডিভাইসের সংযোগ নেই', 'Device disconnected'), message: bilingual('ব্যাটারি ও কলারের সংযোগ পরীক্ষা করুন। এটি ডেমো সতর্কতা।', 'Check the collar connection and battery. This is a demo alert.'), createdAt: state.now, status: 'open' });
      notify(state, actor(state).id, bilingual('ডিভাইস পরীক্ষা করুন', 'Check your device'), bilingual('নতুন তথ্য আসছে না।', 'New readings are unavailable.'), 'devices', device.id); return { id };
    }
    case 'alert.simulate': {
      const animal = activeAnimal(state, command.animalId);
      assertDomain(['temperature', 'heart_rate', 'inactivity', 'disconnected', 'emergency'].includes(command.kind) && ['info', 'warning', 'critical'].includes(command.severity));
      assertDomain(!state.alerts.some(item => item.animalId === animal.id && item.kind === command.kind && ['open', 'escalated'].includes(item.status)), 'duplicate');
      const id = nextId(state, 'alert'); const emergency = command.kind === 'emergency';
      const title = emergency ? bilingual('জরুরি সহায়তা · ডেমো', 'Emergency assistance · demo') : bilingual('স্বাস্থ্যের পরিবর্তন · ডেমো', 'Health change · demo');
      state.alerts.push({ id, animalId: animal.id, kind: command.kind, severity: emergency ? 'critical' : command.severity, title, message: bilingual('নমুনা সংকেত। পশুচিকিৎসকের সঙ্গে যোগাযোগ করুন।', 'Sample signal. Contact a veterinarian for assessment.'), createdAt: state.now, status: 'open' });
      animal.status = emergency ? 'critical' : 'attention'; if (command.kind === 'inactivity') animal.productionDrop = true;
      const device = state.devices.find(item => item.animalId === animal.id);
      if (device && device.connected && command.kind !== 'disconnected') device.readings.push({ at: state.now, temperature: 40.2, heartRate: 100, activity: 20 });
      notify(state, animal.ownerId, title, bilingual('সতর্কতা পর্যালোচনা করুন।', 'Review the alert.'), 'alerts', id);
      if (emergency) {
        const vet = state.users.find(item => item.role === 'vet' && item.available && item.status === 'active');
        if (vet) {
          const appointmentId = nextId(state, 'appointment'); state.appointments.push({ id: appointmentId, farmerId: animal.ownerId, animalId: animal.id, vetId: vet.id, alertId: id, scheduledAt: state.now, mode: 'visit', priority: 'emergency', reason: 'জরুরি ডেমো ডিসপ্যাচ / Simulated emergency dispatch', status: 'requested', createdAt: state.now });
          state.alerts[state.alerts.length - 1].appointmentId = appointmentId;
          notify(state, vet.id, title, bilingual('জরুরি অনুরোধ পর্যালোচনা করুন।', 'Review the emergency request.'), 'appointments', appointmentId);
        }
      }
      return { id };
    }
    case 'alert.acknowledge': {
      const alert = findById(state.alerts, command.alertId); ownedAnimal(state, alert.animalId);
      assertDomain(['open', 'escalated'].includes(alert.status), 'invalid_transition'); alert.status = 'acknowledged'; return { id: alert.id };
    }
    case 'appointment.book': {
      const animal = activeAnimal(state, command.animalId); const vet = findById(state.users, command.vetId);
      assertDomain(vet.role === 'vet' && vet.status === 'active' && vet.available, 'invalid_transition');
      assertDomain(isValidDate(command.scheduledAt) && Date.parse(command.scheduledAt) >= Date.parse(state.now) && Date.parse(command.scheduledAt) <= Date.parse(isoAfter(state.now, 1440 * 365)));
      assertDomain(hasText(command.reason, 3, 1000) && ['video', 'visit'].includes(command.mode) && ['routine', 'urgent', 'emergency'].includes(command.priority));
      assertDomain(!state.appointments.some(item => item.animalId === animal.id && item.vetId === vet.id && item.scheduledAt === command.scheduledAt && !['cancelled', 'rejected'].includes(item.status)), 'duplicate');
      availableSlot(state, vet.id, command.scheduledAt);
      const alert = command.alertId ? findById(state.alerts, command.alertId) : undefined;
      if (alert) { assertDomain(alert.animalId === animal.id, 'unauthorized'); assertDomain(alert.status !== 'resolved' && !alert.appointmentId, 'duplicate'); }
      const id = nextId(state, 'appointment');
      state.appointments.push({ id, farmerId: animal.ownerId, animalId: animal.id, vetId: vet.id, alertId: alert?.id, scheduledAt: command.scheduledAt, mode: command.mode, priority: alert ? alert.severity === 'critical' ? 'emergency' : 'urgent' : command.priority, reason: command.reason, status: 'requested', createdAt: state.now });
      if (alert) { alert.appointmentId = id; alert.status = 'acknowledged'; }
      notify(state, vet.id, bilingual('নতুন বুকিং', 'New appointment'), bilingual('কৃষকের অনুরোধ পর্যালোচনা করুন।', 'Review the farmer’s request.'), 'appointments', id); return { id };
    }
    case 'appointment.decide': {
      const vet = actor(state, ['vet']); const appointment = findById(state.appointments, command.appointmentId);
      assertDomain(appointment.vetId === vet.id, 'unauthorized'); assertDomain(appointment.status === 'requested', 'invalid_transition');
      assertDomain(command.accept || hasText(command.note, 3, 1000));
      appointment.status = command.accept ? 'accepted' : 'rejected'; appointment.decisionNote = command.note;
      if (!command.accept && appointment.alertId) { const alert = findById(state.alerts, appointment.alertId); alert.appointmentId = undefined; alert.status = 'escalated'; }
      notify(state, appointment.farmerId, bilingual('বুকিং আপডেট', 'Appointment updated'), command.accept ? bilingual('পশুচিকিৎসক বুকিং গ্রহণ করেছেন।', 'The veterinarian accepted the booking.') : bilingual('বুকিং প্রত্যাখ্যান করা হয়েছে। অন্য সময় বেছে নিন।', 'The booking was declined. Choose another time.'), 'appointments', appointment.id); return { id: appointment.id };
    }
    case 'appointment.cancel':
    case 'appointment.reschedule': {
      const user = actor(state, ['farmer', 'vet']); const appointment = findById(state.appointments, command.appointmentId);
      assertDomain(user.id === appointment.farmerId || user.id === appointment.vetId, 'unauthorized'); assertDomain(['requested', 'accepted'].includes(appointment.status), 'invalid_transition');
      if (command.type === 'appointment.cancel') { assertDomain(hasText(command.reason, 3, 1000)); appointment.status = 'cancelled'; appointment.decisionNote = command.reason; if (appointment.alertId) { const alert = findById(state.alerts, appointment.alertId); alert.appointmentId = undefined; alert.status = 'open'; } }
      else { assertDomain(isValidDate(command.scheduledAt) && Date.parse(command.scheduledAt) > Date.parse(state.now) && Date.parse(command.scheduledAt) <= Date.parse(isoAfter(state.now, 1440 * 365))); availableSlot(state, appointment.vetId, command.scheduledAt, appointment.id); appointment.scheduledAt = command.scheduledAt; appointment.status = 'requested'; }
      notify(state, user.role === 'farmer' ? appointment.vetId : appointment.farmerId, bilingual('বুকিং পরিবর্তন', 'Appointment changed'), bilingual('বুকিংয়ের সময় বা অবস্থা পরিবর্তিত হয়েছে।', 'The appointment time or status has changed.'), 'appointments', appointment.id); return { id: appointment.id };
    }
    case 'consultation.start': {
      const vet = actor(state, ['vet']); const appointment = findById(state.appointments, command.appointmentId);
      assertDomain(vet.id === appointment.vetId, 'unauthorized'); assertDomain(appointment.status === 'accepted', 'invalid_transition'); appointment.status = 'in_progress'; return { id: appointment.id };
    }
    case 'consultation.complete': {
      const vet = actor(state, ['vet']); const appointment = findById(state.appointments, command.appointmentId);
      assertDomain(vet.id === appointment.vetId, 'unauthorized'); assertDomain(appointment.status === 'in_progress', 'invalid_transition');
      assertDomain(hasText(command.diagnosis, 3, 1000) && hasText(command.advice, 3, 2000) && Array.isArray(command.medicines) && command.medicines.length <= 12);
      for (const medicine of command.medicines) assertDomain(hasText(medicine.name, 1, 120) && hasText(medicine.dose, 1, 100) && hasText(medicine.frequency, 1, 100) && Number.isInteger(medicine.days) && medicine.days > 0 && medicine.days <= 90);
      const id = nextId(state, 'prescription'); state.prescriptions.push({ id, appointmentId: appointment.id, animalId: appointment.animalId, farmerId: appointment.farmerId, vetId: vet.id, diagnosis: command.diagnosis, advice: command.advice, medicines: command.medicines, createdAt: state.now });
      appointment.status = 'completed'; appointment.consultationNote = command.diagnosis;
      state.records.push({ id: nextId(state, 'record'), animalId: appointment.animalId, vetId: vet.id, appointmentId: appointment.id, kind: 'treatment', title: bilingual('পশুচিকিৎসকের পরামর্শ · ডেমো', 'Veterinary consultation · demo'), note: `${command.diagnosis}\n${command.advice}`, createdAt: state.now });
      for (const medicine of command.medicines) state.reminders.push({ id: nextId(state, 'reminder'), prescriptionId: id, animalId: appointment.animalId, medicine: medicine.name, time: '08:00', takenDates: [], enabled: true });
      if (appointment.alertId) findById(state.alerts, appointment.alertId).status = 'resolved';
      const animal = findById(state.animals, appointment.animalId); if (!['deceased', 'sold'].includes(animal.status)) animal.status = 'attention';
      notify(state, appointment.farmerId, bilingual('পরামর্শ সম্পন্ন', 'Consultation complete'), bilingual('প্রেসক্রিপশন ও স্বাস্থ্য রেকর্ড আপডেট হয়েছে।', 'Your prescription and health record have been updated.'), 'prescriptions', id);
      for (const policy of state.policies.filter(item => item.animalId === animal.id && item.status === 'active')) notify(state, policy.insurerId, bilingual('প্রতিরোধমূলক যত্নের রেকর্ড', 'Preventive care recorded'), bilingual('ডেমো স্বাস্থ্য রেকর্ড আপডেট হয়েছে; কোনো বাস্তব বোনাস যোগ হয়নি।', 'The demo health record was updated; no real bonus was awarded.'), 'policies', policy.id);
      return { id };
    }
    case 'reminder.toggle':
    case 'reminder.take': {
      const reminder = findById(state.reminders, command.reminderId); ownedAnimal(state, reminder.animalId);
      if (command.type === 'reminder.toggle') { assertDomain(typeof command.enabled === 'boolean'); reminder.enabled = command.enabled; }
      else { assertDomain(reminder.enabled, 'invalid_transition'); const day = state.now.slice(0, 10); assertDomain(!reminder.takenDates.includes(day), 'duplicate'); reminder.takenDates.push(day); }
      return { id: reminder.id };
    }
    default: return undefined;
  }
}
