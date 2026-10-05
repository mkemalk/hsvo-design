# HSVO Design – Web Sitesi Yenileme & Optimizasyon Raporu

Bu proje, **hsvo.com.tr** sitesinin kaynak kodları, görsel varlıkları, içerik mimarisi ve responsive kırılma noktaları derinlemesine analiz edilerek; tespit edilen tüm şablon kalıntılarından, çoklu dil çakışmalarından, aşırı dosya boyutundan ve mobil uyumsuzluklardan arındırılmış **yeni nesil, ultra hızlı ve tam duyarlı (fully responsive)** sürümüdür.

---

## 🔍 Tespit Edilen Kritik Problemler

### 1. Şablon (Template) Kalıntıları & Yanıltıcı Bilgiler
* **Sahte İletişim Bilgileri:** Orijinal Framer şablonundan kalan `tel:555-666-7777` sahte ABD telefon numarası ve bazı butonlarda unutulan `mailto:hello@fabrica.com` e-posta adresi.
* **Şablon Geliştirici Linkleri:** Footer ve buton arkalarında `templifica.com` ve `framer.link/bynneh` gibi şablon üreticisi bağlantıları.
* **Yanlış Proje Kategorileri:** *Fakir TVL 150 Hava Temizleme Cihazı* projesinin altında endüstriyel tasarım yerine şablondan kalan `"Branding"` ve `"Web design"` etiketleri; *TVL 120* altında `"Development"` ibaresi bulunuyordu.
* **Framer Filigranı:** Sayfa altında `"Framer'da yapıldı"` badge'i kurumsal imajı olumsuz etkiliyordu.
* **Eski Telif Yılı:** `"© 2025"` statik olarak kalmıştı.

### 2. Çok Dilli (TR / EN) Yapı Karmaşası
* Türkçe sayfada (`/tr/`) çok sayıda İngilizce metin ve başlık çevrilmeden kalmıştı:
  * *"Have a project in mind? Let's talk."*
  * *"Tell us about your project—whether it's industrial design..."*
  * *"The faces behind HSVO."*
  * *"Exploratory Interview", "Research and Analysis", "Development"*
  * SSS (FAQ) bölümünde Türkçe ve İngilizce sorular birbirine karışmıştı.
* **Kelime Parçalanması (Text Fragmentation):** Framer animasyonları nedeniyle bazı cümleler tek tek `<span>` etiketlerine bölünmüş ve cümle bütünlüğü bozulmuştu.

### 3. Ekran Uyumluluğu & Responsive (Mobil / Tablet / Desktop) Kırılmaları
* **Hatalı CSS Kuralı:** `@media(min-width: 1440px) and (max-width: 1439.98px)` şeklinde matematiksel olarak imkansız ve çakışan bir breakpoint kuralı mevcuttu.
* **Mobil Menü Çakışması:** Dar ekranlarda (320px–480px) sabit üst bar ekranı kaplıyor, tıklama hedefleri eziliyor ve form alanları klavye açıldığında taşıyordu.
* **Tablet (600px–810px) Taşmaları:** Grid sütunları belirli ara çözünürlüklerde `white-space: pre` kullanımı sebebiyle metinleri kutuların dışına taşırıyordu.
* **Geniş Ekran Hiyerarşisi:** 1440px ve üzeri ultra-geniş monitörlerde bazı bileşenler sola dayalı kalırken bazıları merkezleniyor, grid dengesi bozuluyordu.

### 4. SEO, Semantik HTML ve Performans
* **Aşırı Dosya Boyutu:** Tek bir açılış sayfasının HTML kodu 1.03 MB büyüklüğündeydi (Framer her breakpoint için tüm DOM öğelerini çoğaltmıştı).
* **SEO İndekslenmeme Sorunu:** `site:hsvo.com.tr` sorgusunda neredeyse hiçbir alt sayfa indekslenmemişti; sayfa içinde birden fazla rastgele `<h1>` etiketi vardı.
* **Yazım Hatası:** LinkedIn profil bağlantısında `.../hsvo-design-and-sofware` ("software" yerine "sofware") yazım yanlışı vardı.

---

## 🛠️ Yapılan Düzeltmeler ve Yeni Özellikler

1. **Tam Duyarlı (Full Responsive) Tasarım:**
   * **Mobil (320px – 480px):** Dokunmatik dostu menü çekmecesi, tek sütunlu optimize grid, okunabilir tipografi ve taşmayan formlar.
   * **Tablet (481px – 1024px):** 2 sütunlu dengeli grid, akıcı kart yerleşimi.
   * **Masaüstü & Ultra-Wide (1025px – 2560px+):** Maksimum 1280px sınırlı ve merkezlenmiş, modern karanlık stüdyo estetiği.
2. **Kusursuz İki Dilli Yapı (TR / EN Toggle):**
   * Navigasyon çubuğundaki dil değiştirici ile tek tıkla sayfanın tamamı (başlıklar, açıklamalar, süreç, hizmetler, SSS, butonlar) Türkçe ve İngilizce arasında pürüzsüzce geçer.
3. **Gerçek & Eksiksiz Ekip Kadrosu:**
   * Stüdyodaki 10 ekip üyesi (Mustafa Kemal Karakaya, Cihan Demirel, Çağrı Demirbaş, Tuğçe Oğuztürk, Mert Gürsoy, Çağlar Saatli, Samet Karaca, Büşra Akçay, Yağmur Ovacık, Ümit Sevilmiş) gerçek unvanları ve yüksek çözünürlüklü fotoğraflarıyla yerleştirildi.
4. **Etkileşimli Portfolyo & Proje Detay Modalı:**
   * Fakir TVL 150, TVL 120, Selftea ve Pasteur projeleri doğru kategorileriyle filtrelenebilir yapıldı. Kartlara tıklandığında açılan yüksek çözünürlüklü modal ile tasarım hikayesi ve teknik özellikler incelenebilir.
5. **İnteraktif SSS (Accordion):**
   * Mobilde ve masaüstünde akıcı açılıp kapanan, tüm soruları cevaplayan modern akordeon yapısı.
6. **Çalışan & Doğrulanmış İletişim Formu:**
   * Doğru e-posta (`iletisim@hsvo.com.tr`), telefon (`+90 505 735 31 16`), gerçek LinkedIn ve Instagram linkleri. Form doldurulduğunda anlık görsel geri bildirim ve doğrulama.
7. **Hız ve SEO:**
   * 1.03 MB'lık şişkin dosya boyutu yerine anında açılan, Schema.org `DesignAgency` JSON-LD yapısal verisi, Open Graph ve Twitter kartları içeren optimize kod mimarisi.

---

## 🚀 Çalıştırma ve Önizleme

Projeyi yerel olarak başlatmak için terminalde:

```bash
# Proje dizinine gidin
cd C:\Users\kemal.karakaya\.gemini\antigravity\scratch\hsvo-design

# Yerel sunucuyu başlatın
node server.js
```

Ardından tarayıcınızda açın:
👉 **http://localhost:3000**
