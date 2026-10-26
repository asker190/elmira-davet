---
description: Ana sayfa ve tüm sayfaların görünümünü referans kareler/videoya göre geri getirir ve kilitler (teşhis, onay, düzeltme, görsel regresyon testi).
---
Önce oku: docs/tasarim-kilidi.md, docs/tasarim-referans/README.md ve klasördeki kareler (varsa referans.mp4).
AMAÇ: Ön yüz referanstaki görünümle birebir aynı olacak. Tasarımı iyileştirme, sadeleştirme veya yeniden yorumlama.
Referans ile kod çelişirse ya da referansta görünmeyen bir şey varsa tahmin etme, sor.

AŞAMA 0: TEŞHİS (hiçbir dosyayı değiştirme)
1. Son sağlam sürümü bul. Ön yüz dosyalarının (sayfalar, bileşenler, stiller, tailwind config) git geçmişine bak
   ve referansla eşleşen en son commit/dal adayını söyle. Git yoksa veya sağlam sürüm bulunamazsa DUR ve bana sor.
2. Projeyi çalıştır. Tarayıcı subagent ile 9 sayfayı gez: /, /salonlarimiz, /paketler, /etkinlikler, /galeri,
   /hakkimizda, /yorumlar, /sss, /iletisim (rotalar farklıysa gerçek rotaları kullan). Her sayfada baştan sona
   kaydırarak ekran görüntüsü al. Ekran boyutları: 1600x840 (referans büyük olasılıkla %80 yakınlaştırmayla
   kaydedildi) ve 390x844.
3. Referans karelerle karşılaştır. Her sapmayı tabloya yaz: sayfa | bölüm | referansta | şimdi | olası neden (dosya:satır).
4. Kök nedenleri sınıfla:
   (a) Sayfalar bloklardan render ediliyor ve blok bileşenleri özgün tasarımdan sapmış, kopyalanmış veya stil verisi taşıyor
   (b) bileşen, sınıf veya tasarım token'ı (renk, font, boşluk) değişmiş
   (c) veri eksik veya yanlış (seed, boş alan)
   (d) giriş/scroll-reveal animasyonu içeriği gizli bırakıyor (opacity 0, boş bantlar, hero başlığının görünmemesi)
   (e) Lenis/GSAP/Motion çakışması veya layout kayması
   (f) diğer
5. Ön yüz render zincirinin haritasını çıkar: sayfa -> bileşen -> veri kaynağı (sabit metin mi, veritabanı mı, blok mu).
6. Raporu docs/tasarim-teshis.md dosyasına yaz. Sonra DUR ve onayımı bekle.

AŞAMA 1: GERİ ALMA PLANI (kod yazma, onayımı bekle)
1. Yalnızca ön yüz dosyalarını hedefle. Admin paneli, veritabanı şeması, API, Meta ve Google entegrasyonlarına dokunma.
2. Sınıf (a) varsa: blok sistemi KORUNUR (beğenilen yapı). Blok kaydı özgün site bileşenlerini sarmalayacak şekilde düzeltilir,
   bileşenler yeniden yazılmaz. Kopya/benzer bileşen varsa özgün olana bağlanır. Kayıtlı sayfa verisi korunur.
3. Plan: hangi dosya hangi commit'ten geri alınacak (git restore --source ...), hangisi elle düzeltilecek,
   hangi veriler seed ile geri yüklenecek. Veri kaybı olmayacağını açıkça yaz.
4. Sıra: ortak yapı (Header, Footer, WhatsApp butonu, tasarım token'ları) -> Ana sayfa -> diğer sayfalar.
5. Implementation Plan olarak sun ve onayımı bekle.

AŞAMA 2: DÜZELTME (sayfa sayfa)
Her sayfadan sonra: ekran görüntüsü al, ilgili referans karelerle yan yana göster, kalan sapmaları yaz ve DUR.
Ben "tamam" demeden sonraki sayfaya geçme.
Kurallar: sınıf, stil ve animasyon değerlerini referansa göre geri getir, yeni stil icat etme.
Giriş animasyonlarının sonunda tüm içerik görünür olmalı.

AŞAMA 3: KİLİTLEME
1. Playwright görsel regresyon testi kur (tests/visual): 9 sayfa x (1600x840, 1280x720, 390x844), tam sayfa,
   animasyonlar bitmiş, sayfa sonuna kadar kaydırılıp başa dönülmüş, değişken alanlar (harita iframe, tarih) maskelenmiş.
2. Reveal güvenliği testi: sayfa sonuna kadar gezildikten sonra görünmez kalan (opacity<1, visibility:hidden)
   eleman olmamalı. Hero H1 görünür olmalı, sayfada tek H1 olmalı.
3. Komutlar: npm run test:visual ve npm run test:visual:update (yalnızca benim onayımla çalıştırılır).
4. Baseline görüntülerini ben onayladıktan sonra oluştur. Onaysız baseline üretme.
5. docs/tasarim-kilidi.md sonuna "Test" bölümü ekle (komutlar, eşikler).
6. Son rapor: docs/tasarim-geri-al-rapor.md (düzeltilen sapmalar, kalan sapmalar, bilinen farklar).
