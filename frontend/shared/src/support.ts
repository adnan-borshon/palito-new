import type { DemoCommand, DemoState } from './types.ts';
import { assertDomain } from './errors.ts';
import { actor, bilingual, findById, nextId, notify, payment } from './domain-context.ts';
import { hasText, isBangladeshPhone, isoAfter, normalizePhone } from './validation.ts';

export function handleSupport(state: DemoState, command: DemoCommand): { id?: string } | undefined {
  switch (command.type) {
    case 'auth.requestOtp': {
      assertDomain(typeof command.phone === 'string' && isBangladeshPhone(command.phone)); const phone = normalizePhone(command.phone);
      const user = state.users.find(item => item.phone === phone); assertDomain(user, 'not_found'); assertDomain(user.status === 'active', 'blocked');
      state.session.pendingPhone = phone; state.session.otpExpiresAt = isoAfter(state.now, 5); return {};
    }
    case 'auth.verifyOtp': {
      assertDomain(command.code === '123456' && state.session.pendingPhone && state.session.otpExpiresAt && state.session.otpExpiresAt > state.now, 'otp');
      const user = state.users.find(item => item.phone === state.session.pendingPhone); assertDomain(user, 'not_found'); assertDomain(user.status === 'active', 'blocked');
      state.session.userId = user.id; state.session.pendingPhone = undefined; state.session.otpExpiresAt = undefined; return { id: user.id };
    }
    case 'auth.switch': {
      const user = findById(state.users, command.userId); assertDomain(user.status === 'active', 'blocked'); state.session.userId = user.id; state.session.pendingPhone = undefined; state.session.otpExpiresAt = undefined; return { id: user.id };
    }
    case 'auth.logout': state.session.userId = null; state.session.pendingPhone = undefined; state.session.otpExpiresAt = undefined; return {};
    case 'session.locale': assertDomain(['bn', 'en'].includes(command.locale)); state.session.locale = command.locale; return {};
    case 'session.onboard': state.session.onboarded = true; return {};
    case 'profile.update': {
      const user = actor(state); assertDomain(hasText(command.name, 2, 100) && hasText(command.district, 1, 100));
      user.name = command.name.trim(); user.nameBn = command.name.trim(); user.district = command.district.trim();
      if (command.specialty !== undefined || command.available !== undefined || command.schedule !== undefined) {
        assertDomain(user.role === 'vet', 'unauthorized');
        if (command.specialty !== undefined) { assertDomain(hasText(command.specialty, 2, 200)); user.specialty = command.specialty; }
        if (command.available !== undefined) { assertDomain(typeof command.available === 'boolean'); user.available = command.available; }
        if (command.schedule !== undefined) { assertDomain(hasText(command.schedule, 1, 500)); user.schedule = command.schedule; }
      }
      return { id: user.id };
    }
    case 'ai.ask': {
      const user = actor(state, ['farmer']); assertDomain(hasText(command.text, 2, 2000) && ['text', 'photo', 'voice'].includes(command.mode));
      state.aiMessages.push({ id: nextId(state, 'ai-user'), userId: user.id, role: 'user', text: bilingual(command.text.trim(), command.text.trim()), at: state.now, mode: command.mode });
      const id = nextId(state, 'ai-demo'); state.aiMessages.push({ id, userId: user.id, role: 'assistant', text: bilingual('এটি আগে থেকে লেখা ডেমো উত্তর; ছবি বা কণ্ঠ বিশ্লেষণ করা হয়নি। পশুর পরিচয় ও লক্ষণ নোট করুন এবং পশুচিকিৎসকের পরামর্শ নিন। জরুরি হলে জরুরি সহায়তা খুলুন।', 'This is a scripted demo response; no photo or audio was analysed. Note the animal’s identity and symptoms, and consult a veterinarian. Open emergency assistance for urgent concerns.'), at: state.now, mode: command.mode }); return { id };
    }
    case 'cart.set': {
      const user = actor(state, ['farmer']); const product = findById(state.products, command.productId);
      assertDomain(Number.isInteger(command.quantity) && command.quantity >= 0 && command.quantity <= product.stock && command.quantity <= 99);
      const cart = state.carts[user.id] ?? []; const filtered = cart.filter(item => item.productId !== product.id);
      if (command.quantity > 0) filtered.push({ productId: product.id, quantity: command.quantity }); state.carts[user.id] = filtered; return { id: product.id };
    }
    case 'order.place': {
      const user = actor(state, ['farmer']); const cart = state.carts[user.id] ?? [];
      assertDomain(cart.length > 0 && hasText(command.address, 8, 500));
      const items = cart.map(item => {
        const product = findById(state.products, item.productId); assertDomain(item.quantity > 0 && product.stock >= item.quantity, 'invalid_transition');
        assertDomain(!product.requiresPrescription || state.prescriptions.some(prescription => prescription.farmerId === user.id && prescription.medicines.length > 0), 'invalid_transition');
        return { ...item, price: product.price };
      });
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0); assertDomain(Number.isSafeInteger(total) && total > 0);
      const id = nextId(state, 'order'); payment(state, user.id, 'order', total, 'debit', id);
      for (const item of items) findById(state.products, item.productId).stock -= item.quantity;
      state.orders.push({ id, farmerId: user.id, items, total, address: command.address.trim(), status: 'placed', createdAt: state.now }); state.carts[user.id] = [];
      notify(state, user.id, bilingual('ডেমো অর্ডার সম্পন্ন', 'Demo order placed'), bilingual('নমুনা টাকা কাটা হয়েছে। কোনো বাস্তব ডেলিভারি হবে না।', 'Sample funds were debited. No real delivery will occur.'), 'orders', id); return { id };
    }
    case 'order.cancel': {
      const user = actor(state, ['farmer']); const order = findById(state.orders, command.orderId); assertDomain(order.farmerId === user.id, 'unauthorized'); assertDomain(['placed', 'confirmed'].includes(order.status), 'invalid_transition');
      payment(state, user.id, 'order', order.total, 'credit', order.id); for (const item of order.items) findById(state.products, item.productId).stock += item.quantity; order.status = 'cancelled'; return { id: order.id };
    }
    case 'order.advance': {
      const user = actor(state, ['farmer', 'admin']); const order = findById(state.orders, command.orderId); assertDomain(user.role === 'admin' || order.farmerId === user.id, 'unauthorized');
      const statuses = ['placed', 'confirmed', 'shipped', 'delivered'] as const; const index = statuses.indexOf(order.status as typeof statuses[number]); assertDomain(index >= 0 && index < 3, 'invalid_transition'); order.status = statuses[index + 1];
      notify(state, order.farmerId, bilingual('ডেমো ডেলিভারি আপডেট', 'Demo delivery updated'), bilingual('অর্ডারের অবস্থা অনুকরণ করা হয়েছে।', 'The order’s delivery status was simulated.'), 'orders', order.id); return { id: order.id };
    }
    case 'notification.read': {
      const user = actor(state);
      if (command.notificationId) { const notification = findById(state.notifications, command.notificationId); assertDomain(notification.userId === user.id, 'unauthorized'); notification.read = true; }
      else for (const notification of state.notifications.filter(item => item.userId === user.id)) notification.read = true;
      return {};
    }
    case 'settings.notifications': actor(state); assertDomain(typeof command.enabled === 'boolean'); state.settings.notifications = command.enabled; return {};
    case 'admin.userStatus': {
      const admin = actor(state, ['admin']); const user = findById(state.users, command.userId); assertDomain(user.id !== admin.id, 'unauthorized'); assertDomain(['active', 'suspended'].includes(command.status)); user.status = command.status; return { id: user.id };
    }
    case 'admin.userRole': {
      const admin = actor(state, ['admin']); const user = findById(state.users, command.userId); assertDomain(user.id !== admin.id, 'unauthorized'); assertDomain(['farmer', 'vet', 'bank', 'insurer', 'admin'].includes(command.role));
      // Established domain relationships retain their role; change unused demo accounts only.
      const linked = state.animals.some(item => item.ownerId === user.id) || state.appointments.some(item => item.vetId === user.id || item.farmerId === user.id) || state.policies.some(item => item.insurerId === user.id) || state.loans.some(item => item.bankId === user.id);
      assertDomain(!linked || user.role === command.role, 'invalid_transition'); user.role = command.role; return { id: user.id };
    }
    case 'content.save': {
      actor(state, ['admin']); assertDomain(hasText(command.title?.bn, 3, 150) && hasText(command.title?.en, 3, 150) && hasText(command.body?.bn, 8, 10000) && hasText(command.body?.en, 8, 10000) && ['health', 'nutrition', 'finance'].includes(command.category) && ['draft', 'published'].includes(command.status));
      const id = command.id ?? nextId(state, 'content'); const content = { id, title: command.title, body: command.body, category: command.category, status: command.status, updatedAt: state.now };
      if (command.id) Object.assign(findById(state.content, command.id), content); else state.content.push(content); return { id };
    }
    default: return undefined;
  }
}
