# Phoenix Boss - AI Dashboard & Widgets

![Phoenix Boss](public/og-image.png)

## Proje Hakkında
**Phoenix Boss**, modern web teknolojileri ile geliştirilmiş, çok işlevli ve entegre bir yapay zeka (AI) asistanına sahip kapsamlı bir dashboard uygulamasıdır. Bu uygulama, günlük ihtiyaç duyduğunuz pek çok veriyi hızlıca size sunar ve güçlü AI dil modelleriyle (LLM) gerçek zamanlı sohbet imkanı sağlar.

## 🚀 Özellikler

- **🤖 Akıllı Yapay Zeka Sohbet Asistanı:** 
  - Gelişmiş veri akışı (streaming) altyapısı.
  - Farklı AI modelleri arasında geçiş yapabilme imkanı (Örn: Llama-3.3-70b-versatile, Gemini vb.).
  - Görüntü yükleme ve analiz desteği.
  - Sohbet geçmişini yerel cihazda (localStorage) saklayabilme.

- **📊 Canlı Veri Widgetları:** 
  - 🗞️ **Haberler (News):** Güncel olaylar ve son dakika gelişmeleri.
  - 💰 **Finans ve Kredi (Credit):** Finansal analizler, veriler.
  - ⚽ **Spor ve Futbol (Football):** Futbol skorları ve spor güncellemeleri.
  - 🕌 **Namaz Vakitleri (Pray):** Günlük lokasyon bazlı ibadet saatleri.
  - ⛽ **Akaryakıt Fiyatları (Gas):** Güncel benzin ve motorin istasyon fiyatları.
  - 🌤️ **Hava Durumu (Weather):** Günlük ve anlık meteorolojik durum.

- **⏰ Saat ve Gösterge Tablosu:** 
  - Tam ekran (h-dvh) deneyimi sunan, şık ve okunabilir bir ön yüz düzeni.
  - Gelişmiş UI/UX tasarımı.

## 💻 Teknolojiler ve Bağımlılıklar

Proje son teknoloji frontend araçlarıyla inşa edilmiştir:

- **Framework:** [Next.js](https://nextjs.org/) (React 19, App Router)
- **Programlama Dili:** TypeScript
- **Stil & UI:** [Tailwind CSS](https://tailwindcss.com/) (v4), Radix UI (Bileşen Seti), Lucide React (İkonlar)
- **AI Entegrasyonları:** `@ai-sdk/groq`, `ai` (Vercel AI SDK), `groq-sdk`, `@inworld/tts`
- **Tasarım Araçları:** `tailwindcss-animate`, `clsx`, `tailwind-merge`
- **Paket Yöneticisi:** `pnpm`

## 🛠️ Kurulum Yönergeleri

Yerel ortamınızda projeyi çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/KULLANICI_ADI/phoenix-boss.git
cd phoenix-boss
```

### 2. Bağımlılıkları Yükleyin
Proje paket yöneticisi olarak `pnpm` kullanmaktadır. (Eğer pnpm bilgisayarınızda yüklü değilse `npm install -g pnpm` komutu ile yükleyebilirsiniz.)
```bash
pnpm install
```

### 3. Çevresel Değişkenleri Ayarlayın
Kök dizinde bir `.env` (veya `.env.local`) dosyası oluşturun ve sisteminiz için gerekli tüm API anahtarlarınızı dosya içine tanımlayın:
```env
# Örnek Çevresel Değişkenler
GROQ_API_KEY=senin-groq-api-anahtarin
# Diğer gerekli API anahtarları (Hava durumu, Haberler vb.)
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
pnpm run dev
```
Uygulama başarıyla başladığında `http://localhost:3000` adresinden görüntüleyebilirsiniz.

## 📦 Build Almak
Projeyi prodüksiyona hazırlamak (deploy) isterseniz:
```bash
pnpm run build
pnpm run start
```
komutlarını kullanabilirsiniz.

---
**Not:** Bu proje kişisel veya ticari asistan projelerine hız kazandırmak için bir başlangıç şablonu ve bir arayüz bütünü olarak hizmet edebilir. Geliştirmeleriniz için şimdiden kolay gelsin!
