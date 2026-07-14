# Team Lobby Website

منصة Team Lobby باتجاه **Competitive Neon**: موقع تسويقي عام + لوحة تحكم خاصة متصلة ببوتات Discord من خلال Agent آمن يعمل على Windows.

## ما تم تنفيذه

- واجهة رئيسية احترافية متجاوبة مع الكمبيوتر والموبايل.
- عرض مرئي للفرق النشطة واللاعبين والألعاب المدعومة.
- أقسام المميزات، خطوات الانضمام، الأسئلة الشائعة، ودعوات واضحة للانضمام إلى Discord.
- لوحة **Lobby Control V2** ثنائية اللغة (العربية والإنجليزية) مع اتجاه RTL تلقائي وحفظ اختيار اللغة.
- إدارة حالة البوتات، Start/Stop/Restart، السجلات، حالة Discord، الرسائل الخاصة، وسجل تدقيق.
- كتالوج أوامر معتمد لكل بوت مع تشغيل/تعطيل الأمر، وقت تهدئة، وقوائم رتب وقنوات Discord المسموح بها.
- أوضاع حماية Omar Guard: Passive / Active / Lockdown، وإعدادات آمنة لألعاب Lobby Games.
- تسجيل Discord OAuth مقصور على قائمة Discord IDs محددة.
- تشفير AES-256-GCM لحمولة أوامر التحكم والرسائل أثناء وجودها في قائمة الانتظار.
- تكامل Supabase مع RLS مغلق على جداول التحكم، والوصول الخادمي فقط عبر Service Role.
- صور أصلية محسّنة للويب وأيقونة خاصة بالموقع.
- بيانات SEO وOpen Graph وفهرسة سليمة لمحركات البحث.
- تحديث Next.js وReact وفحص الاعتمادات الأمنية.

> لا تضع `SUPABASE_SERVICE_ROLE_KEY` أو `CONTROL_AGENT_SECRET` أو `CONTROL_PAYLOAD_ENCRYPTION_KEY` في أي متغير يبدأ بـ`NEXT_PUBLIC_`.

## التشغيل محليًا

يتطلب Node.js 20.9 أو أحدث.

```bash
npm install
npm run dev
```

ثم افتح `http://localhost:3000`.

## تهيئة لوحة التحكم

1. للمشروع الجديد شغّل `supabase/control-plane.sql`. وإذا كانت النسخة الأولى مثبّتة بالفعل، شغّل فقط `supabase/control-center-v2.sql` داخل SQL Editor.
2. فعّل Discord Provider داخل Supabase Authentication.
3. ضع Callback URL الظاهر في Supabase داخل Discord Developer Portal.
4. أضف `https://team-lobby.ddns.net/auth/callback` إلى Redirect URLs داخل Supabase.
5. انسخ `.env.example` إلى `.env.local` محليًا، وأضف نفس القيم إلى Vercel Environment Variables.
6. شغّل حزمة `team-lobby-agent` على جهاز Windows تحت PM2.

أنشئ مفتاح تشفير حمولة الأوامر في PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
[Convert]::ToBase64String($bytes)
```

أنشئ سر الـAgent بالطريقة نفسها باستخدام 48 بايت، وضع نفس السر محليًا وفي Vercel.

## تعديل رابط Discord

الرابط موجود مرة واحدة في بداية الملف:

`src/app/page.jsx`

داخل الثابت `DISCORD_URL`.

## فحص نسخة الإنتاج

```bash
npm run build
npm start
```

## النشر على Vercel

ارفع ملفات المشروع إلى نفس مستودع GitHub المتصل بـVercel، ثم ادفع التحديث إلى فرع `main`. سيكتشف Vercel مشروع Next.js ويعيد النشر تلقائيًا.

لا ترفع مجلدي `node_modules` أو `.next`؛ وهما مستبعدان بالفعل داخل `.gitignore`.
