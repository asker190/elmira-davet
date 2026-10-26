---
description: Tasarımda KASITLI bir değişiklik yapılacağı zaman güvenli akış: etki analizi, önce/sonra, blok şeması ve kayıtlı içeriğin korunması, onaylı baseline güncelleme.
---
Bu workflow, "tasarımı güncelle/değiştir/düzelt/eşitle" dediğimde kullanılır. Normal içerik ve editör işleri tasarımı değiştirmez.
Kural: Yalnızca tek kaynak site bileşenleri düzenlenir (ör. components/site). Editör için kopya yazılmaz.
Blok verisi ve kayıtlı sayfalar bozulmaz. Önce docs/tasarim-kilidi.md ve docs/canli-sayfa-editoru-senaryolar.md oku.

1. İsteği netleştir: neyi, hangi sayfa/bölümde, nasıl değiştireceğimi tek cümleyle yaz ve onayımı al.
2. Etki analizi (kod yazma): dokunulacak bileşenler, etkilenen bloklar ve sayfalar, blok şemasının ve kayıtlı içeriğin etkilenip etkilenmediği,
   editör tuvaline etkisi. Şema değişikliği gerekiyorsa: sürüm artışı + migrasyon + varsayılan değer planı. Mümkünse şemayı değiştirmeden çöz.
   Analizi sun ve onayımı bekle.
3. "Önce" ekran görüntülerini al (etkilenen sayfalar, 1600x840, 1280x720, 390x844; hem ön yüz hem editör tuvali).
4. Değişikliği yalnızca tek kaynak bileşenlerde yap. Editörün ve sitenin ikisinin de birlikte değiştiğini doğrula.
5. "Sonra" ekran görüntülerini al, önce/sonra karşılaştırmasını göster. İstenmeyen fark varsa düzelt.
6. Kayıtlı sayfaların hepsini editörde aç: hatalı blok yok, veri kaybı yok. npm run test:visual yalnızca istediğim alanlarda fark vermeli.
7. Ben onaylamadan baseline güncelleme (npm run test:visual:update). Onaydan sonra güncelle.
8. docs/tasarim-kilidi.md dosyasını ve docs/tasarim-degisiklik-gunlugu.md dosyasını güncelle (ne, neden, hangi dosyalar, tarih).
