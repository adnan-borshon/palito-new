import { useState } from 'react';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { demoBalance, type AIMessage } from '@palito/shared';
import { AppText, Badge, Button, Card, Choice, EmptyState, Field, Icon, Screen, Section } from '@/components/ui';
import { useDemo } from '@/providers/demo';
import { colors } from '@/theme';
import { palitoImages } from '../../../assets/palito/manifest';
import { DemoNotice, Meta, Status, useConfirmAction } from '../common/helpers';
import { useFinanceConfirmation } from '../finance/components';
import { go, MissingRecord, s } from './components';

export function AICompanionScreen() {
  const { state, user, t, locale, date, run, busy } = useDemo();
  const animals = state.animals.filter(a => a.ownerId === user?.id && !['sold', 'deceased'].includes(a.status));
  const [animalId, setAnimalId] = useState(animals[0]?.id ?? '');
  const [mode, setMode] = useState<AIMessage['mode']>('text');
  const [text, setText] = useState('');
  const [voiceStage, setVoiceStage] = useState<'idle' | 'recording' | 'ready'>('idle');
  const [photoSelected, setPhotoSelected] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const selectedAnimal = animals.find(a => a.id === animalId);
  const messages = state.aiMessages.filter(m => m.userId === user?.id);

  const submitQuery = async (customText?: string) => {
    setAttempted(true);
    const payload = (customText ?? text).trim();
    if (payload.length < 2) return;
    const prefix = selectedAnimal ? `[${selectedAnimal.name} · ${selectedAnimal.tag}] ` : '';
    const result = await run({ type: 'ai.ask', text: `${prefix}${payload}`, mode });
    if (result.ok) {
      setText('');
      if (mode === 'voice') setVoiceStage('idle');
    }
  };

  return (
    <Screen title={t('পালিত AI সহকারী', 'Palito AI companion')} testID="farmer-ai">
      <Card style={styles.aiHero}>
        <View style={s.row}>
          <Icon name="sparkles-outline" color="#7E22CE" />
          <AppText variant="heading" style={s.flex}>{t('পশুস্বাস্থ্য নির্দেশিকা ডেমো', 'Livestock guidance demo')}</AppText>
          <Badge tone="info">{t('ডেমো AI', 'Demo AI')}</Badge>
        </View>
        <AppText variant="small">
          {t(
            'এটি পূর্বনির্ধারিত প্রাণিসম্পদ সহায়তা ডেমো। কোনো আসল AI মডেল, ক্যামেরা বিশ্লেষণ বা কণ্ঠ প্রক্রিয়াকরণ হচ্ছে না।',
            'This is a deterministic livestock guidance simulation. No live AI model, camera recognition, or voice processing runs here.',
          )}
        </AppText>
      </Card>

      {animals.length ? (
        <Choice
          label={t('কোন পশুর বিষয়ে জানতে চান?', 'Which animal is this about?')}
          value={animalId}
          onChange={setAnimalId}
          options={animals.map(a => ({ value: a.id, label: `${a.name} (${a.tag})` }))}
          testID="ai-animal-choice"
        />
      ) : null}

      <Choice
        label={t('সহায়তার ধরন', 'Input mode')}
        value={mode}
        onChange={next => {
          setMode(next);
          setAttempted(false);
        }}
        options={[
          { value: 'text', label: t('লক্ষণ লিখুন', 'Text symptoms') },
          { value: 'photo', label: t('ছবি যাচাই ডেমো', 'Photo check demo') },
          { value: 'voice', label: t('কণ্ঠ ডেমো', 'Voice demo') },
        ]}
        testID="ai-mode"
      />

      {mode === 'text' ? (
        <Card>
          <AppText variant="label">{t('সাধারণ লক্ষণ নির্বাচন বা লিখুন', 'Choose a symptom or type below')}</AppText>
          <View style={s.wrap}>
            {[
              t('জ্বর ও খাবার কম খাচ্ছে', 'High fever and reduced appetite'),
              t('দুধ উৎপাদন হঠাৎ কমে গেছে', 'Sudden drop in milk yield'),
              t('হাঁটতে সমস্যা বা খুঁড়িয়ে হাঁটা', 'Limping or hoof discomfort'),
            ].map(sample => (
              <Button
                key={sample}
                title={sample}
                variant="secondary"
                onPress={() => setText(sample)}
              />
            ))}
          </View>
          <Field
            label={t('লক্ষণের বিবরণ', 'Describe livestock symptoms')}
            value={text}
            onChangeText={setText}
            multiline
            placeholder={t('যেমন: সকাল থেকে জাবর কাটছে না…', 'e.g. Not ruminating since morning…')}
            testID="ai-text-input"
            error={attempted && text.trim().length < 2 ? t('অন্তত ২ অক্ষরে লক্ষণ লিখুন।', 'Enter at least 2 characters.') : undefined}
          />
          <Button
            title={t('ডেমো পরামর্শ নিন', 'Get demo guidance')}
            loading={busy}
            onPress={() => void submitQuery()}
            testID="ai-submit-text"
          />
        </Card>
      ) : null}

      {mode === 'photo' ? (
        <Card>
          <AppText variant="heading">{t('গবাদিপশুর নমুনা ছবি বিশ্লেষণ', 'Sample livestock photo inspection')}</AppText>
          <AppText variant="small" color={colors.muted}>
            {t('ক্যামেরা খোলা হয় না; নিচের অনুমোদিত গরুর নমুনা ছবি ব্যবহার করে ফলাফল দেখুন।', 'The camera is not accessed; use the bundled cattle sample image below to preview the photo workflow.')}
          </AppText>
          <Button
            title={photoSelected ? t('নমুনা ছবি নির্বাচন করা হয়েছে', 'Sample cattle photo selected') : t('গরুর নমুনা ছবি নির্বাচন করুন', 'Select sample cattle photo')}
            variant="secondary"
            icon="image-outline"
            onPress={() => setPhotoSelected(true)}
            testID="ai-select-photo"
          />
          {photoSelected ? (
            <>
              <Image
                source={palitoImages.cow}
                contentFit="contain"
                style={styles.samplePhoto}
                accessibilityLabel={t('গরুর নমুনা ছবি', 'Sample cattle image')}
              />
              <Button
                title={t('নমুনা ছবি বিশ্লেষণ করুন', 'Run demo photo check')}
                loading={busy}
                onPress={() =>
                  void submitQuery(
                    t(
                      'নমুনা ছবি: গরুর চামড়া ও বাহ্যিক অবস্থার ডেমো পর্যবেক্ষণ',
                      'Sample photo: simulated visual check of cattle coat and posture',
                    ),
                  )
                }
                testID="ai-submit-photo"
              />
            </>
          ) : null}
        </Card>
      ) : null}

      {mode === 'voice' ? (
        <Card style={styles.voiceCard}>
          <View style={s.row}>
            <Icon name="mic-outline" color={colors.brandDark} size={28} />
            <View style={s.flex}>
              <AppText variant="heading">{t('কণ্ঠ সহায়তা ডেমো', 'Voice assistance demo')}</AppText>
              <AppText variant="small" color={colors.muted}>
                {voiceStage === 'idle'
                  ? t('মাইক্রোফোন ছাড়াই নমুনা রেকর্ডিং ও ট্রান্সক্রিপ্ট দেখুন।', 'Simulate start, stop and transcript review without using the device microphone.')
                  : voiceStage === 'recording'
                    ? t('ডেমো রেকর্ডিং চলছে…', 'Simulated recording in progress…')
                    : t('নমুনা ট্রান্সক্রিপ্ট প্রস্তুত', 'Sample transcript ready for review')}
              </AppText>
            </View>
          </View>
          {voiceStage === 'idle' ? (
            <Button
              title={t('ডেমো ভয়েস শুরু করুন', 'Start simulated recording')}
              icon="mic-outline"
              onPress={() => setVoiceStage('recording')}
              testID="ai-voice-start"
            />
          ) : voiceStage === 'recording' ? (
            <Button
              title={t('রেকর্ডিং থামান ও লেখা দেখুন', 'Stop & review transcript')}
              variant="danger"
              icon="stop-circle-outline"
              onPress={() => {
                setVoiceStage('ready');
                setText(
                  t(
                    'আমার গরু সকাল থেকে খাবার কম খাচ্ছে এবং শরীরের তাপমাত্রা বেশি মনে হচ্ছে।',
                    'My cow has been eating less since morning and feels warmer than usual.',
                  ),
                );
              }}
              testID="ai-voice-stop"
            />
          ) : (
            <>
              <Field
                label={t('নমুনা ট্রান্সক্রিপ্ট', 'Simulated transcript')}
                value={text}
                onChangeText={setText}
                multiline
                testID="ai-voice-transcript"
              />
              <Button
                title={t('ট্রান্সক্রিপ্ট পাঠান', 'Send transcript')}
                loading={busy}
                onPress={() => void submitQuery()}
                testID="ai-submit-voice"
              />
            </>
          )}
        </Card>
      ) : null}

      <Section title={t('কথোপকথনের ইতিহাস', 'Conversation history')}>
        {messages.length ? (
          messages.map(msg => (
            <Card
              key={msg.id}
              style={msg.role === 'assistant' ? styles.assistantBubble : undefined}
              testID={`ai-msg-${msg.id}`}
            >
              <View style={s.row}>
                <Badge tone={msg.role === 'assistant' ? 'success' : 'info'}>
                  {msg.role === 'assistant' ? t('পালিত ডেমো উত্তর', 'Palito demo reply') : t('আপনি', 'You')}
                </Badge>
                <Badge>{msg.mode}</Badge>
                <AppText variant="caption" color={colors.muted}>{date(msg.at)}</AppText>
              </View>
              <AppText>{msg.text[locale]}</AppText>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="sparkles-outline"
            title={t('এখনও কোনো প্রশ্ন করা হয়নি', 'No questions asked yet')}
            description={t('উপরের যেকোনো মাধ্যম বেছে পশুর লক্ষণ পাঠান।', 'Choose text, photo or voice mode above to test livestock guidance.')}
          />
        )}
      </Section>

      <Card>
        <AppText variant="label">{t('চিকিৎসকের পরামর্শ প্রয়োজন?', 'Need clinical care?')}</AppText>
        <View style={s.wrap}>
          <Button title={t('ভেট বুক করুন', 'Book a vet')} variant="secondary" onPress={() => go('vets')} />
          <Button title={t('জরুরি সেবা', 'Emergency care')} variant="danger" onPress={() => go('emergency')} />
        </View>
      </Card>
    </Screen>
  );
}

export function ShopScreen() {
  const { state, user, t, locale, money, run, busy } = useDemo();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const farm = state.farms.find(f => f.ownerId === user?.id);
  const [address, setAddress] = useState(farm ? `${farm.address}, ${farm.district}` : 'শাহজাদপুর, সিরাজগঞ্জ / Shahjadpur, Sirajganj');
  const [attempted, setAttempted] = useState(false);
  const { confirm, dialog } = useFinanceConfirmation();

  const cart = (user && state.carts[user.id]) ?? [];
  const hasPrescription = state.prescriptions.some(p => p.farmerId === user?.id && p.medicines.length > 0);
  const walletBalance = user ? demoBalance(state, user.id) : 0;

  const products = state.products.filter(product => {
    const matchesCat = category === 'all' || product.category === category;
    const matchesQuery = `${product.name.bn} ${product.name.en}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCat && matchesQuery;
  });

  const cartTotal = cart.reduce((sum, item) => {
    const prod = state.products.find(p => p.id === item.productId);
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const checkout = () => {
    setAttempted(true);
    if (!cart.length || address.trim().length < 8) return;
    confirm({
      title: t('ডেমো অর্ডার নিশ্চিত করুন', 'Confirm demo order'),
      description: `${t('মোট মূল্য', 'Total')}: ${money(cartTotal)}\n${t('ঠিকানা', 'Address')}: ${address.trim()}\n${t('ডেমো ওয়ালেট থেকে কাটা হবে; কোনো আসল পণ্য পাঠানো হবে না।', 'Debited from demo wallet; no physical goods are shipped.')}`,
      command: { type: 'order.place', address: address.trim() },
      onSuccess: id => go('order', id),
    });
  };

  return (
    <Screen
      title={t('ওষুধ ও পশুখাদ্য', 'Medicine & feed store')}
      back
      testID="farmer-shop"
      action={<Button title={t('অর্ডারসমূহ', 'Orders')} variant="ghost" onPress={() => go('orders')} />}
    >
      <Field
        label={t('পণ্য খুঁজুন', 'Search catalog')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('খাদ্য, মিনারেল বা কলার', 'Feed, mineral mix or collar')}
        testID="shop-search"
      />
      <Choice
        label={t('বিভাগ', 'Category')}
        value={category}
        onChange={setCategory}
        options={[
          { value: 'all', label: t('সব', 'All') },
          { value: 'feed', label: t('খাদ্য', 'Feed') },
          { value: 'medicine', label: t('ওষুধ', 'Medicine') },
          { value: 'equipment', label: t('সরঞ্জাম', 'Equipment') },
        ]}
      />

      <Section title={t('উপলব্ধ পণ্য', 'Available products')}>
        {products.length ? (
          products.map(product => {
            const inCart = cart.find(c => c.productId === product.id)?.quantity ?? 0;
            const blockedRx = product.requiresPrescription && !hasPrescription;
            return (
              <Card key={product.id} testID={`product-${product.id}`}>
                <View style={s.row}>
                  <View style={s.flex}>
                    <AppText variant="heading">{product.name[locale]}</AppText>
                    <AppText variant="small" color={colors.muted}>
                      {product.unit[locale]} · {t('মজুদ', 'Stock')}: {product.stock}
                    </AppText>
                  </View>
                  <AppText variant="title" color={colors.brandDark}>{money(product.price)}</AppText>
                </View>
                {product.requiresPrescription ? (
                  <Badge tone={hasPrescription ? 'success' : 'warning'}>
                    {hasPrescription
                      ? t('প্রেসক্রিপশন যাচাইকৃত', 'Prescription on file')
                      : t('ভেটের প্রেসক্রিপশন প্রয়োজন', 'Requires veterinary prescription')}
                  </Badge>
                ) : null}
                <View style={s.wrap}>
                  <Button
                    title={inCart > 0 ? `${t('যোগ করা হয়েছে', 'In cart')} (${inCart})` : t('ব্যাগে যোগ করুন', 'Add to cart')}
                    variant={inCart > 0 ? 'secondary' : 'primary'}
                    disabled={busy || product.stock === 0 || blockedRx}
                    onPress={() => void run({ type: 'cart.set', productId: product.id, quantity: Math.min(product.stock, inCart + 1) })}
                    testID={`add-cart-${product.id}`}
                  />
                  {inCart > 0 ? (
                    <Button
                      title={t('সরান', 'Remove')}
                      variant="ghost"
                      disabled={busy}
                      onPress={() => void run({ type: 'cart.set', productId: product.id, quantity: 0 })}
                    />
                  ) : null}
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState title={t('কোনো পণ্য পাওয়া যায়নি', 'No matching products')} />
        )}
      </Section>

      <Section title={t('আপনার ব্যাগ ও চেকআউট', 'Cart & checkout')}>
        {cart.length ? (
          <Card>
            {cart.map(item => {
              const prod = state.products.find(p => p.id === item.productId);
              if (!prod) return null;
              return (
                <Meta
                  key={item.productId}
                  label={`${prod.name[locale]} × ${item.quantity}`}
                  value={money(prod.price * item.quantity)}
                />
              );
            })}
            <Meta label={t('মোট মূল্য', 'Order total')} value={money(cartTotal)} />
            <Meta label={t('ডেমো ওয়ালেট ব্যালেন্স', 'Demo wallet balance')} value={money(walletBalance)} />
            <Field
              label={t('ডেলিভারি ঠিকানা', 'Delivery address')}
              value={address}
              onChangeText={setAddress}
              multiline
              testID="order-address"
              error={attempted && address.trim().length < 8 ? t('সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন (অন্তত ৮ অক্ষর)।', 'Enter a complete delivery address (at least 8 characters).') : undefined}
            />
            <Button
              title={t('ডেমো অর্ডার সম্পন্ন করুন', 'Place demo order')}
              disabled={busy}
              onPress={checkout}
              testID="place-order"
            />
          </Card>
        ) : (
          <Card>
            <AppText color={colors.muted}>{t('আপনার ব্যাগ খালি। উপরে থেকে পণ্য যোগ করুন।', 'Your cart is empty. Add items from the catalog above.')}</AppText>
          </Card>
        )}
      </Section>
      <DemoNotice />
      {dialog}
    </Screen>
  );
}

export function OrdersScreen({ id }: { id?: string }) {
  const { state, user, t, locale, money, date, run, busy } = useDemo();
  const confirm = useConfirmAction();
  const orders = state.orders
    .filter(item => item.farmerId === user?.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const selected = id ? orders.find(item => item.id === id) : undefined;

  if (id && !selected) {
    return (
      <Screen title={t('অর্ডার', 'Order')} back>
        <MissingRecord title={t('অর্ডারটি পাওয়া যায়নি', 'Order unavailable')} />
      </Screen>
    );
  }

  const list = selected ? [selected] : orders;

  return (
    <Screen
      title={t('আমার অর্ডার ও ডেলিভারি', 'Orders & delivery tracking')}
      back
      testID="farmer-orders"
      action={<Button title={t('দোকান', 'Shop')} variant="ghost" onPress={() => go('shop')} />}
    >
      {list.length ? (
        list.map(order => (
          <Card key={order.id} testID={`order-${order.id}`}>
            <View style={s.row}>
              <AppText variant="heading" style={s.flex}>{order.id}</AppText>
              <Status value={order.status} />
            </View>
            <AppText variant="small" color={colors.muted}>{date(order.createdAt)}</AppText>
            {order.items.map(item => {
              const prod = state.products.find(p => p.id === item.productId);
              return (
                <Meta
                  key={item.productId}
                  label={`${prod ? prod.name[locale] : item.productId} × ${item.quantity}`}
                  value={money(item.price * item.quantity)}
                />
              );
            })}
            <Meta label={t('মোট পরিশোধিত', 'Total paid')} value={money(order.total)} />
            <Meta label={t('ডেলিভারি ঠিকানা', 'Delivery address')} value={order.address} />
            <Badge tone="info">
              {t('ধাপসমূহ: অর্ডার → নিশ্চিত → পথে আছে → পৌঁছেছে', 'Stages: Placed → Confirmed → Shipped → Delivered')}
            </Badge>
            <View style={s.wrap}>
              {['placed', 'confirmed', 'shipped'].includes(order.status) ? (
                <Button
                  title={t('পরবর্তী ডেলিভারি ধাপ দেখান (ডেমো)', 'Simulate next delivery step')}
                  variant="secondary"
                  loading={busy}
                  onPress={() => void run({ type: 'order.advance', orderId: order.id })}
                  testID={`advance-order-${order.id}`}
                />
              ) : null}
              {['placed', 'confirmed'].includes(order.status) ? (
                <Button
                  title={t('অর্ডার বাতিল ও অর্থ ফেরত', 'Cancel order & refund')}
                  variant="danger"
                  disabled={busy}
                  onPress={() =>
                    confirm.open(
                      { type: 'order.cancel', orderId: order.id },
                      t('অর্ডার বাতিল করবেন?', 'Cancel this order?'),
                      t('ডেমো ওয়ালেটে সম্পূর্ণ অর্থ ফেরত দেওয়া হবে।', 'The full amount will be refunded to your demo wallet.'),
                      undefined,
                      true,
                    )
                  }
                  testID={`cancel-order-${order.id}`}
                />
              ) : null}
            </View>
          </Card>
        ))
      ) : (
        <EmptyState
          icon="cube-outline"
          title={t('এখনও কোনো অর্ডার নেই', 'No orders yet')}
          description={t('ওষুধ বা পশুখাদ্য অর্ডার করলে এখানে ডেলিভারির অবস্থা দেখা যাবে।', 'Place an order in the store to track simulated delivery status here.')}
          action={<Button title={t('ওষুধ ও খাবার দেখুন', 'Browse store')} onPress={() => go('shop')} />}
        />
      )}
      <DemoNotice />
      {confirm.dialog}
    </Screen>
  );
}

const styles = StyleSheet.create({
  aiHero: { backgroundColor: '#F3E8FF', borderColor: '#D8B4FE' },
  samplePhoto: { width: '100%', height: 170, borderRadius: 16 },
  voiceCard: { backgroundColor: colors.brandPale, borderColor: '#B1D4BE' },
  assistantBubble: { backgroundColor: colors.brandPale, borderColor: '#B1D4BE' },
});
