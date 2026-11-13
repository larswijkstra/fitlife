import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useRef,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const COLORS = {
  green: '#37D39A',
  blue: '#5DA9FF',
  orange: '#FFAA5C',
  purple: '#A88BFF',
  ink: '#101828',
  muted: '#8E9AAF',
  dark: '#0B1220',
  card: '#151F31',
  light: '#F5F7FB',
  line: '#273249',
};

const initialData = {
  steps: 6420,
  water: 1.7,
  active: 32,
  week: 4,
  goals: { steps: 10000, water: 2.5, active: 45, week: 7 },
};

function Ring({ value, color, icon, label, detail, size = 132, theme }) {
  const percent = Math.min(value, 100);
  const border = Math.max(5, Math.round(size / 18));
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, { toValue: percent, duration: 700, useNativeDriver: true }).start();
  }, [percent, progress]);
  const rotation = progress.interpolate({ inputRange: [0, 100], outputRange: ['-45deg', '315deg'] });
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderWidth: border, borderColor: `${color}35` }]}>
      <Animated.View style={[styles.ringProgress, { width: size, height: size, borderRadius: size / 2, borderWidth: border, borderColor: color, borderRightColor: 'transparent', borderBottomColor: percent > 50 ? color : 'transparent', transform: [{ rotate: rotation }] }]} />
      <View style={styles.ringContent}>
        <Ionicons name={icon} size={19} color={color} />
        <Text style={[styles.ringPercent, { color: theme.text }]}>{Math.round(percent)}%</Text>
        <Text style={[styles.ringLabel, { color: theme.muted }]}>{label}</Text>
      </View>
    </View>
  );
}

function Card({ children, theme, style }) {
  return <View style={[styles.card, { backgroundColor: theme.card }, style]}>{children}</View>;
}

function Header({ theme, onTheme }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={[styles.eyebrow, { color: theme.muted }]}>DONDERDAG 6 NOVEMBER</Text>
        <Text style={[styles.title, { color: theme.text }]}>Goed bezig, Lars <Text style={{ color: COLORS.orange }}>✦</Text></Text>
      </View>
      <Pressable onPress={onTheme} style={[styles.iconButton, { backgroundColor: theme.card }]}>
        <Ionicons name={theme.dark ? 'sunny-outline' : 'moon-outline'} size={21} color={theme.text} />
      </Pressable>
    </View>
  );
}

function Home({ data, setData, theme, onTheme, onProfile }) {
  const add = (field, amount) => setData((current) => ({ ...current, [field]: Math.max(0, current[field] + amount) }));
  const percent = (field) => Math.round((data[field] / data.goals[field]) * 100);
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      <Header theme={theme} onTheme={onTheme} />
      <View style={styles.streakRow}>
        <View style={styles.streakIcon}><Ionicons name="flame" size={20} color={COLORS.orange} /></View>
        <View style={{ flex: 1 }}><Text style={[styles.streakTitle, { color: theme.text }]}>4 dagen streak</Text><Text style={[styles.caption, { color: theme.muted }]}>Hou het vol, je bent goed bezig!</Text></View>
        <Pressable onPress={onProfile}><Text style={{ color: COLORS.purple, fontWeight: '700' }}>Profiel</Text></Pressable>
      </View>

      <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: theme.text }]}>Jouw dag</Text><Text style={[styles.dateText, { color: theme.muted }]}>Vandaag</Text></View>
      <Card theme={theme} style={styles.heroCard}>
        <View style={styles.ringsRow}>
          <Ring value={percent('steps')} color={COLORS.green} icon="footsteps" label="Stappen" size={146} theme={theme} />
          <View style={styles.ringSide}>
            <View style={styles.miniStat}><View style={[styles.dot, { backgroundColor: COLORS.green }]} /><View><Text style={[styles.miniValue, { color: theme.text }]}>{data.steps.toLocaleString('nl-NL')}</Text><Text style={[styles.miniLabel, { color: theme.muted }]}>van {data.goals.steps.toLocaleString('nl-NL')}</Text></View></View>
            <View style={styles.miniStat}><View style={[styles.dot, { backgroundColor: COLORS.blue }]} /><View><Text style={[styles.miniValue, { color: theme.text }]}>{data.water.toFixed(1)} L</Text><Text style={[styles.miniLabel, { color: theme.muted }]}>water gedronken</Text></View></View>
          </View>
        </View>
        <View style={styles.quickActions}>
          <Pressable onPress={() => add('steps', 500)} style={[styles.quickButton, { backgroundColor: `${COLORS.green}18` }]}><Ionicons name="add" size={17} color={COLORS.green} /><Text style={[styles.quickText, { color: COLORS.green }]}>500 stappen</Text></Pressable>
          <Pressable onPress={() => add('water', 0.25)} style={[styles.quickButton, { backgroundColor: `${COLORS.blue}18` }]}><Ionicons name="water" size={17} color={COLORS.blue} /><Text style={[styles.quickText, { color: COLORS.blue }]}>250 ml water</Text></Pressable>
        </View>
      </Card>

      <View style={styles.ringGrid}>
        <Card theme={theme} style={styles.smallRingCard}><Ring value={percent('water')} color={COLORS.blue} icon="water" label="Water" size={104} theme={theme} /><Text style={[styles.cardDetail, { color: theme.muted }]}>{data.water.toFixed(2)} / {data.goals.water.toFixed(1)} L</Text></Card>
        <Card theme={theme} style={styles.smallRingCard}><Ring value={percent('active')} color={COLORS.orange} icon="flash" label="Beweging" size={104} theme={theme} /><Text style={[styles.cardDetail, { color: theme.muted }]}>{data.active} / {data.goals.active} min</Text></Card>
        <Card theme={theme} style={styles.smallRingCard}><Ring value={(data.week / data.goals.week) * 100} color={COLORS.purple} icon="trophy" label="Weekdoel" size={104} theme={theme} /><Text style={[styles.cardDetail, { color: theme.muted }]}>{data.week} / {data.goals.week} trainingen</Text></Card>
      </View>

      <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: theme.text }]}>Snelle acties</Text><Text style={[styles.dateText, { color: COLORS.purple }]}>Alles bekijken</Text></View>
      <Card theme={theme} style={styles.actionList}>
        <ActionRow icon="barbell" color={COLORS.purple} title="Training toevoegen" subtitle="Log je workout van vandaag" onPress={() => add('active', 15)} theme={theme} />
        <ActionRow icon="restaurant" color={COLORS.orange} title="Maaltijd loggen" subtitle="Houd je voeding bij" onPress={() => Alert.alert('Voeding', 'Ga naar het tabblad Voeding om een maaltijd toe te voegen.')} theme={theme} />
      </Card>
    </ScrollView>
  );
}

function ActionRow({ icon, color, title, subtitle, onPress, theme }) {
  return <Pressable onPress={onPress} style={styles.actionRow}><View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={20} color={color} /></View><View style={{ flex: 1 }}><Text style={[styles.actionTitle, { color: theme.text }]}>{title}</Text><Text style={[styles.caption, { color: theme.muted }]}>{subtitle}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.muted} /></Pressable>;
}

function Activity({ theme, data, setData }) {
  const workouts = [{ icon: 'walk', title: 'Wandeling', detail: '3,2 km · 38 min', color: COLORS.green }, { icon: 'barbell', title: 'Krachttraining', detail: 'Bovenlichaam · 45 min', color: COLORS.purple }, { icon: 'bicycle', title: 'Fietsen', detail: '8,5 km · 31 min', color: COLORS.blue }];
  return <ScrollView contentContainerStyle={styles.scroll}><View style={styles.header}><View><Text style={[styles.eyebrow, { color: theme.muted }]}>BEWEGING</Text><Text style={[styles.title, { color: theme.text }]}>Activiteit</Text></View><View style={[styles.iconButton, { backgroundColor: theme.card }]}><Ionicons name="calendar-outline" size={21} color={theme.text} /></View></View><Card theme={theme} style={styles.activitySummary}><View><Text style={[styles.caption, { color: theme.muted }]}>Actieve minuten</Text><Text style={[styles.bigNumber, { color: theme.text }]}>{data.active}<Text style={styles.unit}> min</Text></Text><Text style={{ color: COLORS.green, fontWeight: '700' }}>+12% deze week</Text></View><View style={styles.bars}>{[32, 54, 42, 75, 58, 90, 45].map((height, index) => <View key={index} style={styles.barWrap}><View style={[styles.bar, { height, backgroundColor: index === 5 ? COLORS.purple : `${COLORS.purple}35` }]} /><Text style={[styles.barLabel, { color: theme.muted }]}>{['M', 'D', 'W', 'D', 'V', 'Z', 'Z'][index]}</Text></View>)}</View></Card><View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: theme.text }]}>Workout starten</Text></View><View style={styles.workoutGrid}>{[['walk', 'Wandelen', COLORS.green], ['bicycle', 'Fietsen', COLORS.blue], ['barbell', 'Kracht', COLORS.purple], ['fitness', 'Hardlopen', COLORS.orange]].map(([icon, name, color]) => <Pressable key={name} onPress={() => setData((d) => ({ ...d, active: d.active + 15 }))} style={[styles.workout, { backgroundColor: theme.card }]}><View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}><Ionicons name={icon} size={22} color={color} /></View><Text style={[styles.workoutName, { color: theme.text }]}>{name}</Text><Text style={[styles.caption, { color: theme.muted }]}>Start nu</Text></Pressable>)}</View><View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: theme.text }]}>Recente trainingen</Text></View><Card theme={theme}>{workouts.map((workout) => <ActionRow key={workout.title} {...workout} subtitle={workout.detail} theme={theme} onPress={() => {}} />)}</Card></ScrollView>;
}

function Nutrition({ theme, data, setData }) {
  const meals = [['Ontbijt', 'Havermout met banaan', '420 kcal', 'sunny-outline'], ['Lunch', 'Volkoren wrap met kip', '560 kcal', 'restaurant-outline'], ['Tussendoortje', 'Griekse yoghurt', '180 kcal', 'ice-cream-outline']];
  return <ScrollView contentContainerStyle={styles.scroll}><View style={styles.header}><View><Text style={[styles.eyebrow, { color: theme.muted }]}>VOEDING & HYDRATATIE</Text><Text style={[styles.title, { color: theme.text }]}>Voeding</Text></View><View style={[styles.iconButton, { backgroundColor: theme.card }]}><Ionicons name="add" size={22} color={theme.text} /></View></View><Card theme={theme} style={styles.calorieCard}><View><Text style={[styles.caption, { color: theme.muted }]}>Calorieën vandaag</Text><Text style={[styles.bigNumber, { color: theme.text }]}>1.160 <Text style={styles.unit}>/ 2.200 kcal</Text></Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: '53%', backgroundColor: COLORS.orange }]} /></View></View><View style={[styles.actionIcon, { backgroundColor: `${COLORS.orange}20` }]}><Ionicons name="restaurant" size={24} color={COLORS.orange} /></View></Card><View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: theme.text }]}>Waterinname</Text><Text style={[styles.dateText, { color: theme.muted }]}>{data.water.toFixed(2)} / {data.goals.water.toFixed(1)} L</Text></View><Card theme={theme} style={styles.waterCard}><View style={styles.waterDrops}>{[0, 1, 2, 3, 4, 5].map((drop) => <Ionicons key={drop} name="water" size={28} color={drop < Math.round(data.water / 0.25) ? COLORS.blue : `${COLORS.blue}30`} />)}</View><Pressable onPress={() => setData((d) => ({ ...d, water: Math.min(d.goals.water, d.water + 0.25) }))} style={[styles.addWater, { backgroundColor: `${COLORS.blue}18` }]}><Ionicons name="add" size={18} color={COLORS.blue} /><Text style={{ color: COLORS.blue, fontWeight: '700' }}>250 ml toevoegen</Text></Pressable></Card><View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: theme.text }]}>Vandaag</Text><Text style={[styles.dateText, { color: COLORS.orange }]}>Dagboek bewerken</Text></View><Card theme={theme}>{meals.map(([meal, item, kcal, icon]) => <View key={meal} style={styles.mealRow}><View style={[styles.actionIcon, { backgroundColor: `${COLORS.orange}18` }]}><Ionicons name={icon} size={20} color={COLORS.orange} /></View><View style={{ flex: 1 }}><Text style={[styles.actionTitle, { color: theme.text }]}>{meal}</Text><Text style={[styles.caption, { color: theme.muted }]}>{item}</Text></View><Text style={[styles.kcal, { color: theme.text }]}>{kcal}</Text></View>)}</Card></ScrollView>;
}

function Stats({ theme, data }) {
  return <ScrollView contentContainerStyle={styles.scroll}><View style={styles.header}><View><Text style={[styles.eyebrow, { color: theme.muted }]}>INZICHTEN</Text><Text style={[styles.title, { color: theme.text }]}>Statistieken</Text></View><View style={[styles.iconButton, { backgroundColor: theme.card }]}><Ionicons name="options-outline" size={21} color={theme.text} /></View></View><Card theme={theme} style={styles.statsCard}><View style={styles.statsTop}><View><Text style={[styles.caption, { color: theme.muted }]}>Activiteit deze week</Text><Text style={[styles.bigNumber, { color: theme.text }]}>246 <Text style={styles.unit}>min</Text></Text></View><Text style={{ color: COLORS.green, fontWeight: '700' }}>+18,4%</Text></View><View style={styles.chart}>{[42, 70, 56, 88, 62, 100, 78].map((height, index) => <View key={index} style={styles.chartColumn}><Text style={[styles.chartValue, { color: theme.muted }]}>{height}</Text><View style={[styles.chartBar, { height: height * 1.15, backgroundColor: index === 5 ? COLORS.purple : `${COLORS.purple}45` }]} /><Text style={[styles.barLabel, { color: theme.muted }]}>{['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'][index]}</Text></View>)}</View></Card><Text style={[styles.sectionTitle, { color: theme.text, marginVertical: 16 }]}>Jouw voortgang</Text><View style={styles.metricGrid}>{[['Stappen', '42.580', '+8,2%', COLORS.green, 'footsteps'], ['Trainingen', '4', '+1', COLORS.purple, 'trophy'], ['Water', '11,2 L', '+2,4 L', COLORS.blue, 'water'], ['Gewicht', '78,4 kg', '-0,8 kg', COLORS.orange, 'scale-outline']].map(([label, value, change, color, icon]) => <Card theme={theme} key={label} style={styles.metric}><Ionicons name={icon} size={20} color={color} /><Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text><Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text><Text style={{ color, fontWeight: '700', fontSize: 12 }}>{change}</Text></Card>)}</View></ScrollView>;
}

function Profile({ theme, data, setData, onTheme }) {
  const [editing, setEditing] = useState(false);
  const [goals, setGoals] = useState(data.goals);
  const save = () => { setData((d) => ({ ...d, goals })); setEditing(false); };
  return <ScrollView contentContainerStyle={styles.scroll}><View style={styles.profileHeader}><View style={styles.avatar}><Text style={styles.avatarText}>LW</Text></View><Text style={[styles.title, { color: theme.text }]}>Lars Wijkstra</Text><Text style={[styles.caption, { color: theme.muted }]}>lars@fitlife.app</Text><View style={styles.memberPill}><Ionicons name="sparkles" size={14} color={COLORS.orange} /><Text style={{ color: COLORS.orange, fontWeight: '700' }}>PRO MEMBER</Text></View></View><Card theme={theme}><ActionRow icon="person-outline" color={COLORS.purple} title="Persoonlijke gegevens" subtitle="Naam, leeftijd en voorkeuren" onPress={() => {}} theme={theme} /><ActionRow icon="moon-outline" color={COLORS.blue} title="Weergave" subtitle={theme.dark ? 'Donkere modus' : 'Lichte modus'} onPress={onTheme} theme={theme} /></Card><View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: theme.text }]}>Persoonlijke doelen</Text><Pressable onPress={() => editing ? save() : setEditing(true)}><Text style={{ color: COLORS.purple, fontWeight: '700' }}>{editing ? 'Opslaan' : 'Bewerken'}</Text></Pressable></View><Card theme={theme}>{[['steps', 'Dagelijkse stappen', 'stappen'], ['water', 'Dagelijks water', 'liter'], ['active', 'Actieve minuten', 'minuten']].map(([key, label, unit]) => <View key={key} style={styles.goalRow}><View style={{ flex: 1 }}><Text style={[styles.actionTitle, { color: theme.text }]}>{label}</Text><Text style={[styles.caption, { color: theme.muted }]}>Doel per dag</Text></View>{editing ? <TextInput value={String(goals[key])} onChangeText={(text) => setGoals((g) => ({ ...g, [key]: Number(text) || 0 }))} keyboardType="numeric" style={[styles.goalInput, { color: theme.text, borderColor: theme.line }]} /> : <Text style={[styles.goalValue, { color: theme.text }]}>{goals[key]} {unit}</Text>}</View>)}</Card><Pressable style={styles.signOut} onPress={() => Alert.alert('Uitloggen', 'Je bent veilig uitgelogd.')}><Ionicons name="log-out-outline" size={19} color="#FF6B78" /><Text style={{ color: '#FF6B78', fontWeight: '700' }}>Uitloggen</Text></Pressable></ScrollView>;
}

export default function App() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState('Home');
  const [data, setData] = useState(initialData);
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch((error) => console.warn('FitLife service worker could not be registered.', error));
    }
  }, []);
  useEffect(() => { AsyncStorage.multiGet(['fitlife-theme', 'fitlife-data']).then(([theme, stored]) => { if (theme[1]) setDark(theme[1] === 'dark'); if (stored[1]) setData(JSON.parse(stored[1])); }).catch((error) => console.warn('FitLife preferences could not be loaded.', error)); }, []);
  useEffect(() => { AsyncStorage.setItem('fitlife-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { AsyncStorage.setItem('fitlife-data', JSON.stringify(data)); }, [data]);
  const theme = useMemo(() => dark ? { dark: true, bg: COLORS.dark, card: COLORS.card, text: '#F7F9FC', muted: COLORS.muted } : { dark: false, bg: COLORS.light, card: '#FFFFFF', text: COLORS.ink, muted: '#667085' }, [dark]);
  const screens = { Home: <Home data={data} setData={setData} theme={theme} onTheme={() => setDark(!dark)} onProfile={() => setTab('Profiel')} />, Activiteit: <Activity theme={theme} data={data} setData={setData} />, Voeding: <Nutrition theme={theme} data={data} setData={setData} />, Statistieken: <Stats theme={theme} data={data} />, Profiel: <Profile theme={theme} data={data} setData={setData} onTheme={() => setDark(!dark)} /> };
  const tabs = [['Home', 'home'], ['Activiteit', 'walk'], ['Voeding', 'restaurant'], ['Statistieken', 'stats-chart'], ['Profiel', 'person']];
  return <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}><StatusBar barStyle={dark ? 'light-content' : 'dark-content'} /><View style={styles.main}>{screens[tab]}</View><View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.line }]}>{tabs.map(([name, icon]) => <Pressable key={name} onPress={() => setTab(name)} style={styles.tab}><Ionicons name={icon + (tab === name ? '' : '-outline')} size={22} color={tab === name ? COLORS.purple : theme.muted} /><Text style={[styles.tabLabel, { color: tab === name ? COLORS.purple : theme.muted }]}>{name}</Text></Pressable>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  main: { flex: 1 }, scroll: { padding: 20, paddingBottom: 32 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 }, title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }, iconButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 }, streakIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: `${COLORS.orange}18` }, streakTitle: { fontSize: 14, fontWeight: '800', marginBottom: 3 }, caption: { fontSize: 12 }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 3 }, sectionTitle: { fontSize: 17, fontWeight: '800' }, dateText: { fontSize: 12, fontWeight: '700' }, card: { borderRadius: 22, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, heroCard: { padding: 18 }, ringsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, ring: { alignItems: 'center', justifyContent: 'center', position: 'relative' }, ringProgress: { position: 'absolute' }, ringContent: { alignItems: 'center', gap: 1 }, ringPercent: { fontSize: 22, fontWeight: '800', color: '#F7F9FC' }, ringLabel: { color: '#AAB3C2', fontSize: 11, fontWeight: '600' }, ringSide: { gap: 20 }, miniStat: { flexDirection: 'row', alignItems: 'center', gap: 10 }, dot: { width: 9, height: 9, borderRadius: 5 }, miniValue: { fontSize: 16, fontWeight: '800' }, miniLabel: { fontSize: 11, marginTop: 2 }, quickActions: { flexDirection: 'row', gap: 9, marginTop: 18 }, quickButton: { flex: 1, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 }, quickText: { fontSize: 11, fontWeight: '800' }, ringGrid: { flexDirection: 'row', gap: 9, marginBottom: 21 }, smallRingCard: { flex: 1, alignItems: 'center', paddingHorizontal: 5, paddingVertical: 13 }, cardDetail: { fontSize: 10, marginTop: 9, textAlign: 'center' }, actionList: { paddingVertical: 5 }, actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 }, actionIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, actionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 3 }, activitySummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, bigNumber: { fontSize: 30, fontWeight: '800', marginVertical: 7 }, unit: { fontSize: 14, fontWeight: '600', color: COLORS.muted }, bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 105 }, barWrap: { alignItems: 'center', justifyContent: 'flex-end', gap: 5 }, bar: { width: 7, borderRadius: 5 }, barLabel: { fontSize: 10 }, workoutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }, workout: { width: (width - 50) / 2, padding: 14, borderRadius: 18 }, workoutName: { fontWeight: '800', marginTop: 10, marginBottom: 3 }, calorieCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, progressTrack: { height: 7, backgroundColor: `${COLORS.orange}20`, borderRadius: 4, width: 190 }, progressFill: { height: 7, borderRadius: 4 }, waterCard: { alignItems: 'center' }, waterDrops: { flexDirection: 'row', gap: 9, marginBottom: 16 }, addWater: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 5 }, mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }, kcal: { fontSize: 12, fontWeight: '700' }, statsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 170, paddingTop: 12 }, chartColumn: { alignItems: 'center', justifyContent: 'flex-end', gap: 5 }, chartValue: { fontSize: 9 }, chartBar: { width: 20, borderRadius: 7 }, metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, metric: { width: (width - 50) / 2, minHeight: 125 }, metricLabel: { fontSize: 12, marginTop: 13, marginBottom: 5 }, metricValue: { fontSize: 18, fontWeight: '800', marginBottom: 5 }, profileHeader: { alignItems: 'center', marginBottom: 24 }, avatar: { width: 80, height: 80, borderRadius: 28, backgroundColor: `${COLORS.purple}30`, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, avatarText: { color: COLORS.purple, fontSize: 24, fontWeight: '800' }, memberPill: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: `${COLORS.orange}18`, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 11, marginTop: 12 }, goalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: `${COLORS.line}70` }, goalValue: { fontWeight: '800' }, goalInput: { borderWidth: 1, borderRadius: 9, padding: 7, width: 75, textAlign: 'right' }, signOut: { flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 13, padding: 14 }, tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 9, paddingBottom: Platform.OS === 'ios' ? 8 : 10 }, tab: { flex: 1, alignItems: 'center', gap: 3 }, tabLabel: { fontSize: 10, fontWeight: '700' },
});
