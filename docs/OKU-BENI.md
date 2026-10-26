
# Güncelleme v2: Canlı editör + tasarım kilidi (Antigravity)

Bu paket, daha önce verilen pakete EK ve ÜZERİNE YAZAR. Referans kareler (docs/tasarim-referans/) ilk paketten zaten projende; bu pakette yok.

1. İçindekileri proje köküne kopyala. Aynı adlı dosyaların üzerine yazılmasına izin ver.
2. Eskiyi kaldır (Customizations > Workflows/Rules veya dosyadan):
   - .agents/workflows/canli-editor.md (varsa): yerine /canli-sayfa-editoru geçti, eskisinde serbest Stil sekmesi var.
   - .agents/workflows/sayfa-yoneticisi.md (varsa): çalıştırma. Liste/revizyon/kilit maddeleri docs/sayfa-yonetimi-senaryolar.md'de duruyor.
   - docs/canli-editor-senaryolar.md (varsa): geçersiz, yerine docs/canli-sayfa-editoru-senaryolar.md geçti.
3. Sıra (her biri YENİ bir konuşmada, Planning modunda):
   a) /tasarim-geri-al        -> ön yüz videodaki gibi olsun, görsel test kurulsun (henüz yapılmadıysa)
   b) /canli-sayfa-editoru    -> editör ön yüzle aynı bileşenleri kullansın, tasarım bozulmadan düzenlenebilsin
   c) /dinamik-admin          -> salon, paket, galeri vb. liste modülleri ve site ayarları (b ile paralel de gidebilir)
4. Tasarımda bilerek bir değişiklik istediğinde SADECE: /tasarim-degistir
   ("tasarımı güncelle" gibi istekleri doğrudan yazma, bu akıştan geçir.)
5. Her aşamada plan artifact'ını oku, yorum bırak, onayladıktan sonra "Dilim n'yi uygula" de.
