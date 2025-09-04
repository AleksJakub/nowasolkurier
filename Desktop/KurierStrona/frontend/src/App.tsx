import { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import api from './api'
import './styles.css'

// Small input sanitizer for basic safety (keeps text user-friendly)
function sanitize(v: string){
  return (v ?? '').toString().replace(/[<>]/g, '').slice(0, 256)
}

// Full list of countries
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo (Congo-Brazzaville)','Costa Rica','Croatia','Cuba','Cyprus','Czechia (Czech Republic)','Democratic Republic of the Congo','Denmark','Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini (fmr. "Swaziland")','Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Holy See','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar (Burma)','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine State','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States of America','Uruguay','Uzbekistan','Vanuatu','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
]
const PALLET_TYPES = [
  { value: '', label: 'Brak palety' },
  { value: 'pallet', label: 'Paleta' },
  { value: 'half_pallet', label: 'Półpaleta' },
  { value: 'industrial_pallet', label: 'Paleta przemysłowa' },
  { value: 'non_standard', label: 'Paleta niestandardowa' },
]
const Handoff = [
  { value: 'facility', label: 'Oddanie w punkcie NowaSolKurier' },
  { value: 'locker', label: 'Oddanie w paczkomacie' },
  { value: 'pickup', label: 'Odbiór od klienta' },
]

function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const isAuthed = !!token
  const login = (t: string) => { localStorage.setItem('token', t); setToken(t) }
  const logout = () => { localStorage.removeItem('token'); setToken(null) }
  return { token, isAuthed, login, logout }
}

function AuthGate({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate()
  const isAuthed = !!localStorage.getItem('token')
  function doLogout(){ localStorage.removeItem('token'); nav('/login') }
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-inner">
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', cursor:'pointer', userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none', msUserSelect:'none', caretColor:'transparent' }}>
            <div style={{ height: 36, overflow: 'visible', lineHeight: 0 }}>
              <img
                src="/images/logo.png"
                alt="NowaSolKurier"
                style={{ height: 36, transform: 'scale(6)', transformOrigin: 'left center', display: 'block' }}
                draggable={false}
              />
            </div>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none', msUserSelect:'none', caretColor:'transparent' }}>
            {isAuthed && <>
              <Link to="/shipments">Wysyłki</Link>
              <Link to="/new-shipment">Nowa przesyłka</Link>
              <Link to="/tracking">Śledzenie</Link>
              <Link to="/profile">Profil</Link>
              <button onClick={doLogout} className="btn btn-ghost logout-button" style={{ marginLeft: 8, height: 36, padding: '0 12px' }}>Wyloguj</button>
            </>}
            {!isAuthed && <Link to="/login">Zaloguj</Link>}
          </nav>
        </div>
      </header>
      <div className="main">{children}</div>
      <footer className="footer" style={{ position:'relative' }}>
        {/* Image anchored above the footer */}
        <div aria-hidden="true" style={{ position:'absolute', right: 12, bottom: 0, opacity: 0.25, pointerEvents:'none', userSelect:'none', zIndex: 0 }}>
          <img src="/images/bg-img.png" alt="" style={{ display:'block', height: 780, width: 'auto', transform: 'translateX(-36px)' }} draggable={false} />
        </div>
        <div style={{ display:'grid', rowGap: 8 }}>
          <div>
            Telefon: <a href="tel:07506684057">07506684057</a> · Email: <a href="mailto:nowasolkurier@wp.pl">nowasolkurier@wp.pl</a>
          </div>
          <div>© {new Date().getFullYear()} NowaSolKurier. Wszelkie prawa zastrzeżone.</div>
        </div>
      </footer>
    </div>
  )
}

function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [err, setErr] = useState<string | null>(null)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  async function submit() {
    setErr(null)
    try {
      if (mode === 'register') {
        if (!email || !password) { setErr('Podaj email i hasło'); return }
        if (password !== confirmPassword) { setErr('Hasła nie są takie same'); return }
        if (!agreeTerms || !agreePrivacy) { setErr('Zaznacz wymagane zgody'); return }
        await api.post('/auth/register', { email, password })
        const { data: loginData } = await api.post('/auth/login', { email, password })
        login(loginData.token)
        nav('/')
        return
      }
      const { data } = await api.post('/auth/login', { email, password })
      login(data.token)
      nav('/')
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Błąd')
    }
  }

  return (
    <Layout>
      <main style={{ maxWidth: 420, margin: '40px auto', padding: '0 16px' }}>
        <div className="card">
          <h2 style={{ margin: 0 }}>{mode === 'login' ? 'Logowanie' : 'Rejestracja'}</h2>
          <p style={{ color: 'var(--muted)', marginTop: 4 }}>{mode === 'login' ? 'Zaloguj się, aby zarządzać przesyłkami.' : 'Utwórz konto, aby korzystać z serwisu.'}</p>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" placeholder="ty@przyklad.pl" value={email} onChange={e=>setEmail(e.target.value)} style={{ width:'100%' }} />
          <label className="label" htmlFor="password" style={{ marginTop: 12 }}>Hasło</label>
          <input id="password" className="input" placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width:'100%' }} />

          {mode === 'register' && (
            <>
              <label className="label" htmlFor="confirm" style={{ marginTop: 12 }}>Potwierdź hasło</label>
              <input id="confirm" className="input" placeholder="••••••••" type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{ width:'100%' }} />

              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop: 12 }}>
                <input id="terms" type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)} />
                <label htmlFor="terms">Akceptuję <Link to="/regulamin">regulamin serwisu</Link></label>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop: 8 }}>
                <input id="privacy" type="checkbox" checked={agreePrivacy} onChange={e=>setAgreePrivacy(e.target.checked)} />
                <label htmlFor="privacy">Akceptuję <Link to="/polityka-prywatnosci">politykę prywatności</Link></label>
              </div>
            </>
          )}

          <div style={{ display:'flex', gap: 8, marginTop: 16 }}>
            <button onClick={submit} className="btn btn-primary" style={{ width: '100%' }}>{mode === 'login' ? 'Zaloguj' : 'Utwórz konto'}</button>
            <button onClick={()=>setMode(mode==='login'?'register':'login')} className="btn btn-ghost" style={{ width: '100%' }}>
              {mode==='login'?'Potrzebujesz konta?':'Masz już konto?'}
            </button>
          </div>
          {err && <p className="error" style={{ marginTop: 8 }}>{err}</p>}
        </div>
      </main>
    </Layout>
  )
}

function TermsPage(){
  return (
    <Layout>
      <main style={{ maxWidth: 900, margin:'24px auto', padding:16 }}>
        <div className="card">
          <h2 style={{ margin:0 }}>Regulamin serwisu</h2>
          <p style={{ color:'var(--muted)', marginTop:6 }}>
            To jest przykładowy regulamin serwisu NowaSolKurier (MVP). Prosimy o zapoznanie się z warunkami
            korzystania z usługi. Pełna treść regulaminu zostanie udostępniona w kolejnych wersjach.
          </p>
        </div>
      </main>
    </Layout>
  )
}

function PrivacyPage(){
  return (
    <Layout>
      <main style={{ maxWidth: 900, margin:'24px auto', padding:16 }}>
        <div className="card">
          <h2 style={{ margin:0 }}>Polityka prywatności</h2>
          <p style={{ color:'var(--muted)', marginTop:6 }}>
            To jest przykładowa polityka prywatności (MVP). Opis zasad przetwarzania danych osobowych będzie
            rozszerzony w kolejnych wersjach serwisu.
          </p>
        </div>
      </main>
    </Layout>
  )
}

function Dashboard() {
  const [shipments, setShipments] = useState<any[]>([])
  useEffect(()=>{ (async()=>{ try{ const { data } = await api.get('/shipments'); setShipments(data.slice(0,5)) } catch{} })() },[])
  return (
    <Layout>
      <main style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
        <div className="card">
          <h2 style={{ margin: 0 }}>Witamy</h2>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Twórz przesyłki, porównuj opcje kurierów i pobieraj etykiety.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Link to="/new-shipment"><button className="btn btn-primary">Nowa przesyłka</button></Link>
            <Link to="/shipments"><button className="btn btn-ghost">Zobacz wysyłki</button></Link>
            <Link to="/tracking"><button className="btn btn-ghost">Śledzenie</button></Link>
          </div>
        </div>
        <div className="card">
          <h2 style={{ margin:0 }}>Ostatnie przesyłki</h2>
          <div style={{ marginTop:12, display:'grid', rowGap:8 }}>
            {shipments.map(s => (
              <div key={s.id} className="list-card" style={{ justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:600 }}>{s.courier?.name}</div>
                  <div style={{ color:'var(--muted)', fontSize:12 }}>Odbiorca: {s.recipient_name}</div>
                </div>
                <div>{new Date(s.created_at).toLocaleString()}</div>
              </div>
            ))}
            {shipments.length === 0 && <div style={{ color:'var(--muted)' }}>Brak przesyłek</div>}
          </div>
        </div>
      </main>
    </Layout>
  )
}

// ---------- New Shipment (spec-compliant) ----------

type NewShipmentForm = {
  recipientName: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  declaredValue?: number;
}

type FieldErrors = Partial<Record<keyof NewShipmentForm, string>>

function isPostalCodeValid(v: string) {
  return /^\d{2}-\d{3}$/.test(v)
}
function normalizePhoneDigits(v: string) {
  return (v || '').replace(/\D/g, '')
}
function isPhoneValid(v: string) {
  const digits = normalizePhoneDigits(v)
  return digits.length >= 9 && digits.length <= 11
}

function validate(form: NewShipmentForm): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.recipientName || form.recipientName.trim().length < 2) errors.recipientName = 'Wpisz poprawne imię i nazwisko'
  const phoneDigits = normalizePhoneDigits(form.phone)
  if (!(phoneDigits.length >= 7 && phoneDigits.length <= 15)) errors.phone = 'Podaj numer telefonu'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Nieprawidłowy email'
  if (!form.street || form.street.trim().length < 3) errors.street = 'Podaj ulicę i numer'
  if (!form.city || form.city.trim().length < 2) errors.city = 'Podaj miejscowość'
  // No postal code validation beyond presence (optional)
  if (!form.country || form.country.trim().length < 2) errors.country = 'Podaj kraj'
  if (!form.weightKg || form.weightKg < 0.1 || form.weightKg > 30) errors.weightKg = '0.1–30 kg'
  if (!form.lengthCm || form.lengthCm < 1 || form.lengthCm > 200) errors.lengthCm = '1–200 cm'
  if (!form.widthCm || form.widthCm < 1 || form.widthCm > 80) errors.widthCm = '1–80 cm'
  if (!form.heightCm || form.heightCm < 1 || form.heightCm > 80) errors.heightCm = '1–80 cm'
  return errors
}

function TextField(props: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  help?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  disabled?: boolean;
}) {
  const { id, label, placeholder, value, onChange, required, error, help, type = 'text', inputMode, disabled } = props
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        inputMode={inputMode}
        disabled={disabled}
        style={{ height: 44, padding: '0 12px', borderRadius: 10, border: `1px solid ${error ? '#B91C1C' : '#D1D5DB'}`, outline: 'none' }}
      />
      {help && !error && <div id={`${id}-help`} style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{help}</div>}
      {error && <div id={`${id}-error`} style={{ fontSize: 12, color: '#B91C1C', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function NumberField(props: {
  id: string;
  label: string;
  placeholder?: string;
  value: number | string;
  onChange: (v: number) => void;
  required?: boolean;
  error?: string;
  help?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  const { id, label, placeholder, value, onChange, required, error, help, min, max, step, unit } = props
  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        type="number"
        min={min}
        max={max}
        step={step}
        style={{ height: 44, padding: '0 36px 0 12px', borderRadius: 10, border: `1px solid ${error ? '#B91C1C' : '#D1D5DB'}`, outline: 'none' }}
      />
      {unit && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: 12 }}>{unit}</span>}
      {help && !error && <div id={`${id}-help`} style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{help}</div>}
      {error && <div id={`${id}-error`} style={{ fontSize: 12, color: '#B91C1C', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.03)', padding: 24, marginTop: 24 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 12 }}>{title}</h2>
      <div style={{ display: 'grid', rowGap: 12 }}>{children}</div>
    </section>
  )
}

// small helper to split address like "Street, 67-100 City, Poland"
function parseAddress(addr: string | undefined){
  if (!addr) return { street: '', city: '', postalCode: '', country: 'Poland' as const }
  try{
    const [streetPart, rest] = addr.split(',')
    const [postalAndCity] = (rest || '').split(',')
    const m = /^(\d{2}-\d{3})\s+(.+)$/.exec((postalAndCity||'').trim())
    return { street: (streetPart||'').trim(), postalCode: m?.[1]||'', city: m?.[2]||'', country: 'Poland' as const }
  }catch{ return { street: '', city: '', postalCode: '', country: 'Poland' as const } }
}

function parseAddressFromProfile(data:any){
  if (data?.billing_address_line1 || data?.billing_postcode || data?.billing_city) {
    return {
      street: [data.billing_address_line1, data.billing_address_line2].filter(Boolean).join(', '),
      postalCode: data.billing_postcode || '',
      city: data.billing_city || '',
      country: data.billing_country || 'Poland',
    }
  }
  return parseAddress(data?.billing_address)
}

function NewShipmentPage() {
  const nav = useNavigate()
  const [form, setForm] = useState<NewShipmentForm>({
    recipientName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Poland',
    weightKg: 1,
    lengthCm: 10,
    widthCm: 10,
    heightCm: 10,
    declaredValue: 0,
  })
  const [palletType, setPalletType] = useState<string>('')
  const [handoffMethod, setHandoffMethod] = useState<string>('facility')
  const [pickupLine1, setPickupLine1] = useState<string>('')
  const [pickupCity, setPickupCity] = useState<string>('')
  const [pickupPostcode, setPickupPostcode] = useState<string>('')
  const [pickupCountry, setPickupCountry] = useState<string>('Poland')

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [topError, setTopError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try{
        const { data } = await api.get('/users/profile')
        const addr = parseAddressFromProfile(data)
        setPickupLine1([data?.billing_address_line1, data?.billing_address_line2].filter(Boolean).join(', '))
        setPickupCity(addr.city)
        setPickupPostcode(addr.postalCode)
        setPickupCountry(addr.country)
        // Do not prepopulate delivery (adres doręczenia) fields
      }catch{}
    })()
  }, [])

  const errors = useMemo(() => validate(form), [form])
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])
  const firstInvalidId = useMemo(() => Object.entries(errors)[0]?.[0], [errors])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!submitting) return
    if (firstInvalidId) {
      const el = document.getElementById(firstInvalidId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setSubmitting(false)
    }
  }, [firstInvalidId, submitting])

  function set<K extends keyof NewShipmentForm>(key: K, value: NewShipmentForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }
  function formatAddress(): string { return `${form.street}, ${form.postalCode} ${form.city}, ${form.country}` }

  async function submit() {
    setTopError(null)
    setSubmitting(true)
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setTouched((t) => ({ ...t, ...Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {}) }))
      setSubmitting(false)
      return
    }
    try {
      const body: any = {
        recipient_name: form.recipientName,
        recipient_phone: normalizePhoneDigits(form.phone),
        recipient_email: form.email || undefined,
        recipient_address: formatAddress(),
        parcel_weight: form.weightKg,
        parcel_length: form.lengthCm,
        parcel_width: form.widthCm,
        parcel_height: form.heightCm,
        country: form.country,
        pallet_type: palletType || undefined,
        handoff_method: handoffMethod || undefined,
        pickup_address: handoffMethod === 'pickup' ? [pickupLine1, `${pickupPostcode} ${pickupCity}`, pickupCountry].filter(Boolean).join(', ') : undefined,
        declared_value: form.declaredValue && form.declaredValue > 0 ? form.declaredValue : undefined,
      }
      const { data } = await api.post('/shipments/quotes', body)
      const normalized = Array.isArray(data?.quotes) ? data.quotes : Array.isArray(data) ? data : []
      const quotes = normalized.map((q: any) => ({
        courierId: q.courierId ?? q.courier_id,
        courierName: q.courierName ?? q.courier_name,
        price: q.price,
        eta: q.eta ?? undefined,
        service: q.service,
      }))
      nav('/choose-courier', { state: { form, quotes, palletType, handoffMethod, pickupLine1, pickupCity, pickupPostcode, pickupCountry } })
    } catch (e) {
      setTopError('Nie udało się pobrać wycen. Spróbuj ponownie.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <main ref={containerRef} style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Utwórz przesyłkę</h1>
        <p style={{ color: '#6B7280', marginTop: 6 }}>Wprowadź dane odbiorcy i paczki, aby zobaczyć ceny kurierów.</p>

        {topError && (
          <div role="alert" className="banner-error" style={{ marginTop: 16 }}>
            {topError}
            <button onClick={() => submit()} className="btn btn-ghost" style={{ marginLeft: 8, height: 32 }}>Spróbuj ponownie</button>
          </div>
        )}

        {/* Removed separate recipient card; moved fields into delivery address */}

        <Card title="Adres doręczenia">
          <TextField id="recipientName" label="Imię i nazwisko" placeholder="np. Jan Kowalski" value={form.recipientName} onChange={(v) => set('recipientName', v)} error={touched.recipientName ? errors.recipientName : undefined} />
          <TextField id="phone" label="Telefon" placeholder="np. 501 234 567" value={form.phone} onChange={(v) => set('phone', v)} help="Użyj numeru z Polski" error={touched.phone ? errors.phone : undefined} inputMode="tel" />
          <TextField id="email" label="Email (opcjonalnie)" placeholder="np. jan.kowalski@example.com" value={form.email || ''} onChange={(v) => set('email', v)} help="Do powiadomień o doręczeniu (opcjonalne)" error={touched.email ? errors.email : undefined} inputMode="email" />
          <fieldset>
            <legend className="sr-only">Adres doręczenia</legend>
            <div style={{ display: 'grid', rowGap: 12 }}>
              <TextField id="street" label="Ulica i numer" placeholder="ul. Kościuszki 12/3" value={form.street} onChange={(v) => set('street', v)} error={touched.street ? errors.street : undefined} />
              <TextField id="city" label="Miejscowość" placeholder="Nowa Sól" value={form.city} onChange={(v) => set('city', v)} error={touched.city ? errors.city : undefined} />
              <TextField id="postalCode" label="Kod pocztowy" placeholder="np. 10115" value={form.postalCode} onChange={(v) => set('postalCode', sanitize(v).slice(0, 16))} error={touched.postalCode ? errors.postalCode : undefined} />
              <div style={{ display:'grid', rowGap: 6 }}>
                <label className="label" htmlFor="country">Kraj</label>
                <select id="country" className="input" value={form.country} onChange={(e)=>set('country', sanitize(e.target.value))} style={{ height: 44, padding: '0 12px', borderRadius: 10, border: `1px solid ${errors.country ? '#B91C1C' : '#D1D5DB'}`, outline: 'none' }}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </fieldset>
        </Card>

        <Card title="Opcje wysyłki">
          <div style={{ display: 'grid', rowGap: 12 }}>
            <div style={{ display:'grid', rowGap: 6 }}>
              <label className="label" htmlFor="pallet">Typ palety</label>
              <select id="pallet" className="input" value={palletType} onChange={(e)=>setPalletType(e.target.value)}>
                {PALLET_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div style={{ display:'grid', rowGap: 6 }}>
              <label className="label" style={{ userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none', msUserSelect:'none', caretColor:'transparent' }}>Przekazanie przesyłki</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 12, userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none', msUserSelect:'none', caretColor:'transparent' }}>
                <div role="button" tabIndex={0} onClick={()=>setHandoffMethod('facility')} onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') setHandoffMethod('facility') }} className="list-card" style={{ flexDirection:'column', alignItems:'center', borderColor: handoffMethod==='facility' ? '#2563EB' : undefined, cursor:'pointer', userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none', msUserSelect:'none', caretColor:'transparent' }}>
                  <img src="/images/postal-service.png" alt="Oddanie w punkcie" style={{ width:64, height:64, objectFit:'contain', marginBottom:8 }} draggable={false} />
                  <div style={{ textAlign:'center' }}>Oddanie w punkcie</div>
                </div>
                <div role="button" tabIndex={0} onClick={()=>setHandoffMethod('locker')} onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') setHandoffMethod('locker') }} className="list-card" style={{ flexDirection:'column', alignItems:'center', borderColor: handoffMethod==='locker' ? '#2563EB' : undefined, cursor:'pointer', userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none', msUserSelect:'none', caretColor:'transparent' }}>
                  <img src="/images/locker.png" alt="Paczkomat" style={{ width:64, height:64, objectFit:'contain', marginBottom:8 }} draggable={false} />
                  <div style={{ textAlign:'center' }}>Paczkomat</div>
                </div>
                <div role="button" tabIndex={0} onClick={()=>setHandoffMethod('pickup')} onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') setHandoffMethod('pickup') }} className="list-card" style={{ flexDirection:'column', alignItems:'center', borderColor: handoffMethod==='pickup' ? '#2563EB' : undefined, cursor:'pointer', userSelect:'none', WebkitUserSelect:'none', MozUserSelect:'none', msUserSelect:'none', caretColor:'transparent' }}>
                  <img src="/images/van.png" alt="Odbiór od klienta" style={{ width:64, height:64, objectFit:'contain', marginBottom:8 }} draggable={false} />
                  <div style={{ textAlign:'center' }}>Odbiór od klienta</div>
                </div>
              </div>
            </div>
            {handoffMethod === 'pickup' && (
              <div style={{ display:'grid', rowGap: 12 }}>
                <div style={{ display:'grid', rowGap: 6 }}>
                  <label className="label" htmlFor="pickup1">Adres (linia 1)</label>
                  <input id="pickup1" className="input" value={pickupLine1} onChange={(e)=>setPickupLine1(sanitize(e.target.value))} />
                </div>
                <div style={{ display:'grid', rowGap: 6 }}>
                  <label className="label" htmlFor="pickupCity">Miejscowość</label>
                  <input id="pickupCity" className="input" value={pickupCity} onChange={(e)=>setPickupCity(sanitize(e.target.value))} />
                </div>
                <div style={{ display:'grid', rowGap: 6 }}>
                  <label className="label" htmlFor="pickupPost">Kod pocztowy</label>
                  <input id="pickupPost" className="input" value={pickupPostcode} onChange={(e)=>setPickupPostcode(sanitize(e.target.value))} />
                </div>
                <div style={{ display:'grid', rowGap: 6 }}>
                  <label className="label" htmlFor="pickupCountry">Kraj</label>
                  <select id="pickupCountry" className="input" value={pickupCountry} onChange={(e)=>setPickupCountry(sanitize(e.target.value))} style={{ height: 44, padding: '0 12px', borderRadius: 10, border: `1px solid ${errors.country ? '#B91C1C' : '#D1D5DB'}`, outline: 'none' }}>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="help">Możesz użyć adresu z profilu lub wpisać inny.</div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Szczegóły paczki">
          <NumberField id="weightKg" label="Waga (kg)" value={form.weightKg} onChange={(v) => set('weightKg', v)} min={0.1} max={30} step={0.1} help="Zaokrąglimy w górę zgodnie z wymogami przewoźników." error={touched.weightKg ? errors.weightKg : undefined} unit="kg" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="dims">
              <NumberField id="lengthCm" label="Długość (cm)" value={form.lengthCm} onChange={(v) => set('lengthCm', v)} min={1} max={200} step={1} unit="cm" error={touched.lengthCm ? errors.lengthCm : undefined} />
              <NumberField id="widthCm" label="Szerokość (cm)" value={form.widthCm} onChange={(v) => set('widthCm', v)} min={1} max={80} step={1} unit="cm" error={touched.widthCm ? errors.widthCm : undefined} />
              <NumberField id="heightCm" label="Wysokość (cm)" value={form.heightCm} onChange={(v) => set('heightCm', v)} min={1} max={80} step={1} unit="cm" error={touched.heightCm ? errors.heightCm : undefined} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label" htmlFor="declaredValue">Wartość (PLN)</label>
            <input id="declaredValue" className="input" type="number" min={0} step={0.01} value={form.declaredValue ?? 0} onChange={(e)=>set('declaredValue', Number(e.target.value))} />
            <div className="help">Deklarowana wartość przesyłki dla celów ubezpieczenia (opcjonalne).</div>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280', border: '1px dashed #E5E7EB', padding: 8, borderRadius: 8 }}>
            Sprawdź limity gabarytów — dłuższy bok ≤ 200 cm, suma boków ≤ 300 cm (zależnie od kuriera).
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'end', gap: 8, marginTop: 16 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button type="button" className="btn btn-ghost">Anuluj</button>
          </Link>
          <button type="button" aria-busy={submitting} onClick={submit} disabled={submitting || !isValid} className="btn btn-primary">
            {submitting ? 'Pobieranie wycen…' : 'Pobierz wyceny kurierów'}
          </button>
        </div>
      </main>
    </Layout>
  )
}

function ChooseCourierPage() {
  const nav = useNavigate()
  const location = useLocation() as any
  const state = location.state as { form: NewShipmentForm; quotes: Array<{ courierId: string; courierName: string; price: number; eta?: string; service?: string }>; palletType?: string; handoffMethod?: string; pickupLine1?: string; pickupCity?: string; pickupPostcode?: string; pickupCountry?: string } | undefined
  const quotes = state?.quotes || []
  const form = state?.form as NewShipmentForm | undefined

  useEffect(() => { if (!state || !state.form) nav('/new-shipment', { replace: true }) }, [state, nav])
  if (!state || !form) return null

  async function selectQuote(q: { courierId: string; courierName: string; price: number; service?: string }) {
    if (!form) { nav('/new-shipment', { replace: true }); return }
    const f = form
    const body: any = {
      courier_id: '00000000-0000-0000-0000-000000000000',
      recipient_name: f.recipientName,
      recipient_address: `${f.street}, ${f.postalCode} ${f.city}, ${f.country}`,
      parcel_weight: f.weightKg,
      parcel_length: f.lengthCm,
      parcel_width: f.widthCm,
      parcel_height: f.heightCm,
      price: q.price,
      service: q.service,
      pallet_type: state?.palletType || undefined,
      handoff_method: state?.handoffMethod || undefined,
      pickup_address: state?.handoffMethod === 'pickup' ? [state?.pickupLine1, `${state?.pickupPostcode} ${state?.pickupCity}`, state?.pickupCountry].filter(Boolean).join(', ') : undefined,
      country: f.country,
      declared_value: f.declaredValue && f.declaredValue > 0 ? f.declaredValue : undefined,
    }
    await api.post('/shipments', body)
    nav('/shipments')
  }
  return (
    <Layout>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Wybierz kuriera</h1>
        <p style={{ color: '#6B7280', marginTop: 6 }}>Wybierz jedną z opcji, aby kontynuować.</p>
        <div style={{ marginTop: 16, display: 'grid', rowGap: 12 }}>
          {quotes.map((q) => (
            <div key={(q.service || q.courierId) + q.price} className="list-card">
              <div>
                <div style={{ fontWeight: 600 }}>{q.courierName}</div>
                <div style={{ color: '#6B7280', fontSize: 12 }}>{q.eta || '1–2 dni'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 700 }}>{q.price.toFixed(2)} PLN</div>
                <button onClick={() => selectQuote(q)} className="btn btn-primary" style={{ height: 36 }}>Wybierz</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  )
}

function TrackingPage(){
  const [tracking, setTracking] = useState('')
  const [result, setResult] = useState<any>(null)
  const [err, setErr] = useState<string | null>(null)

  async function search(){
    setErr(null); setResult(null)
    try{
      const { data } = await api.get(`/public/track/${encodeURIComponent(tracking)}`)
      setResult(data)
    }catch{ setErr('Nie udało się pobrać statusu') }
  }

  return (
    <Layout>
      <main style={{ maxWidth: 800, margin:'24px auto', padding:16 }}>
        <div className="card">
          <h2 style={{ margin:0 }}>Śledzenie przesyłki</h2>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <input className="input" placeholder="Wpisz numer śledzenia" value={tracking} onChange={e=>setTracking(e.target.value)} />
            <button className="btn btn-primary" onClick={search}>Szukaj</button>
          </div>
          {err && <div className="banner-error" style={{ marginTop:12 }}>{err}</div>}
          {result && (
            <div style={{ marginTop:12 }}>
              {result.found ? (
                <div className="list-card" style={{ justifyContent:'space-between' }}>
                  <div>
                    <div><strong>Numer:</strong> {result.tracking}</div>
                    <div><strong>Kurier:</strong> {result.courier}</div>
                    <div><strong>Status:</strong> {result.status}</div>
                  </div>
                  <div>Utworzono: {new Date(result.created_at).toLocaleString()}</div>
                </div>
              ) : 'Nie znaleziono przesyłki'}
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}

function SettingsPage(){
  return (
    <Layout>
      <main style={{ maxWidth: 800, margin:'24px auto', padding:16 }}>
        <div className="card">
          <h2 style={{ margin:0 }}>Ustawienia</h2>
          <p style={{ color:'var(--muted)', marginTop:6 }}>Dodatkowe opcje konfiguracji (MVP).</p>
        </div>
      </main>
    </Layout>
  )
}

function Shipments() {
  type Shipment = { id: string; courier?: { name: string }; recipient_name: string; created_at: string; tracking_number?: string; label_url?: string }
  const [shipments, setShipments] = useState<Shipment[]>([])
  const nav = useNavigate()
  useEffect(() => {
    (async () => {
      const { data } = await api.get('/shipments')
      setShipments(data)
    })()
  }, [])

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
        <h3>Moje przesyłki</h3>
        {shipments.length === 0 && (
          <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', color:'#1E3A8A', borderRadius:10, padding:12, margin:'12px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>Nie masz jeszcze żadnych przesyłek. Utwórz nową, aby rozpocząć.</div>
            <button className="btn btn-primary" onClick={()=>nav('/new-shipment')} style={{ height:36 }}>Nowa przesyłka</button>
          </div>
        )}
        {shipments.map(s => (
          <div key={s.id} style={{ border:'1px solid #eee', padding: 12, marginBottom: 8 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontWeight:'bold' }}>{s.courier?.name}</div>
                <div>Odbiorca: {s.recipient_name}</div>
                <div>Utworzono: {new Date(s.created_at).toLocaleString()}</div>
                <div>Śledzenie: {s.tracking_number}</div>
              </div>
              <div>
                {s.label_url ? (
                  <a href={s.label_url}>
                    <button className="btn btn-ghost">Pobierz etykietę</button>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

function ProfilePage(){
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    billing_address_line1: '',
    billing_address_line2: '',
    billing_city: '',
    billing_postcode: '',
    billing_country: 'Poland',
  })
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    (async () => {
      try{
        const { data } = await api.get('/users/profile')
        setProfile(data)
        setForm({
          full_name: data.full_name || '',
          phone: data.phone || '',
          company_name: data.company_name || '',
          billing_address_line1: data.billing_address_line1 || '',
          billing_address_line2: data.billing_address_line2 || '',
          billing_city: data.billing_city || '',
          billing_postcode: data.billing_postcode || '',
          billing_country: data.billing_country || 'Poland',
        })
      }catch(e:any){ setErr('Nie udało się wczytać profilu') }
      finally{ setLoading(false) }
    })()
  }, [])

  async function save(){
    setErr(null)
    try{
      const { data } = await api.put('/users/profile', form)
      setProfile(data)
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    }catch(e:any){ setErr('Nie udało się zapisać') }
  }

  if (loading) return <Layout><main style={{ maxWidth: 900, margin:'24px auto', padding:16 }}>Ładowanie…</main></Layout>

  return (
    <Layout>
      <main style={{ maxWidth: 900, margin:'24px auto', padding:16 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700 }}>Profil</h1>
        <p style={{ color:'var(--muted)', marginTop:6 }}>Zarządzaj swoimi danymi i saldem.</p>

        {err && <div className="banner-error" style={{ marginTop: 12 }}>{err}</div>}

        <div className="card">
          <h2 style={{ margin:0 }}>Podsumowanie</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12, marginTop:12 }}>
            <div className="list-card" style={{ justifyContent:'space-between' }}>
              <div>Łącznie wysyłek</div>
              <strong>{profile?.stats?.totalShipments ?? 0}</strong>
            </div>
            <div className="list-card" style={{ justifyContent:'space-between' }}>
              <div>Do zapłaty</div>
              <strong>{((profile?.stats?.balanceCents ?? 0)/100).toFixed(2)} PLN</strong>
            </div>
            <div className="list-card" style={{ justifyContent:'space-between' }}>
              <div>Opłacone</div>
              <strong>{((profile?.stats?.paidCents ?? 0)/100).toFixed(2)} PLN</strong>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:16, alignItems:'stretch', marginTop:16 }}>
          <div className="card" style={{ marginTop: 0 }}>
            <h2 style={{ margin:0 }}>Dane osobowe</h2>
            <label className="label" htmlFor="full_name">Imię i nazwisko</label>
            <input id="full_name" className="input" value={form.full_name} onChange={e=>setForm(f=>({ ...f, full_name: e.target.value }))} style={{ width:'100%' }} />

            <div style={{ marginTop: 12, display:'grid', rowGap: 6 }}>
              <label className="label" htmlFor="phone" style={{ marginBottom: 0 }}>Telefon</label>
              <input id="phone" className="input" value={form.phone} onChange={e=>setForm(f=>({ ...f, phone: e.target.value }))} style={{ width:'100%' }} />
            </div>

            <label className="label" htmlFor="company_name" style={{ marginTop: 12 }}>Nazwa firmy</label>
            <input id="company_name" className="input" value={form.company_name} onChange={e=>setForm(f=>({ ...f, company_name: e.target.value }))} style={{ width:'100%' }} />
          </div>

          <div className="card" style={{ marginTop: 0 }}>
            <h2 style={{ margin:0 }}>Adres rozliczeniowy</h2>
            <label className="label" htmlFor="addr1">Adres (linia 1)</label>
            <input id="addr1" className="input" value={form.billing_address_line1} onChange={e=>setForm(f=>({ ...f, billing_address_line1: e.target.value }))} style={{ width:'100%' }} />

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
              <div style={{ display:'grid', rowGap:6 }}>
                <label className="label" htmlFor="addr2" style={{ marginBottom: 0 }}>Adres (linia 2)</label>
                <input id="addr2" className="input" value={form.billing_address_line2} onChange={e=>setForm(f=>({ ...f, billing_address_line2: e.target.value }))} style={{ width:'100%' }} />
              </div>
              <div style={{ display:'grid', rowGap:6 }}>
                <label className="label" htmlFor="city" style={{ marginBottom: 0 }}>Miejscowość</label>
                <input id="city" className="input" value={form.billing_city} onChange={e=>setForm(f=>({ ...f, billing_city: e.target.value }))} style={{ width:'100%' }} />
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12 }}>
              <div style={{ display:'grid', rowGap:6 }}>
                <label className="label" htmlFor="country" style={{ marginBottom: 0 }}>Kraj</label>
                <select id="country" className="input" value={form.billing_country} onChange={e=>setForm(f=>({ ...f, billing_country: e.target.value }))} style={{ width:'100%' }}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', rowGap:6 }}>
                <label className="label" htmlFor="postcode" style={{ marginBottom: 0 }}>Kod pocztowy</label>
                <input id="postcode" className="input" value={form.billing_postcode} onChange={e=>setForm(f=>({ ...f, billing_postcode: e.target.value }))} style={{ width:'100%' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', justifyContent:'end', gap:8, marginTop: 16 }}>
          {justSaved && (
            <button className="btn btn-ghost" disabled style={{ background:'#ECFDF5', borderColor:'#A7F3D0', color:'#065F46' }}>Zapisano</button>
          )}
          <button className="btn btn-ghost" onClick={()=>window.history.back()}>Anuluj</button>
          <button className="btn btn-primary" onClick={save}>Zapisz</button>
        </div>
      </main>
    </Layout>
  )
}

function AppRoutes() {
  const isAuthed = !!localStorage.getItem('token')
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={isAuthed ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/new-shipment" element={<AuthGate><NewShipmentPage /></AuthGate>} />
      <Route path="/choose-courier" element={<AuthGate><ChooseCourierPage /></AuthGate>} />
      {/* Backward compat: redirect old route */}
      <Route path="/new" element={<Navigate to="/new-shipment" replace />} />
      <Route path="/shipments" element={<AuthGate><Shipments /></AuthGate>} />
      <Route path="/profile" element={<AuthGate><ProfilePage /></AuthGate>} />
      <Route path="/tracking" element={<AuthGate><TrackingPage /></AuthGate>} />
      <Route path="/settings" element={<AuthGate><SettingsPage /></AuthGate>} />
      <Route path="/regulamin" element={<TermsPage />} />
      <Route path="/polityka-prywatnosci" element={<PrivacyPage />} />
    </Routes>
  )
}

export default function App(){
  return <AppRoutes />
}
