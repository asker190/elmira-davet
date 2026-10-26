# Elmira Davet — Kapsamlı QA & Güvenlik Denetim Raporu

**Denetçi:** Kıdemli QA Mühendisi & Uygulama Güvenliği Denetçisi  
**Tarih:** 21 Ekim 2026  
**Denetlenen Kapsam:** Ön Yüz, Yönetim Paneli, API Uçları, Veritabanı Şeması, Meta Lead Entegrasyonu  
**Durum:** İnceleme tamamlandı — Kod değişiklikleri öncesi resmi denetim çıktısıdır.

---

## 1. PROJE MİMARİSİ VE DOSYA EŞLEŞTİRME HARİTASI

| Modül | İlgili Dosyalar | İnceleme Senaryoları |
|---|---|---|
| **Veritabanı & Şema** | `prisma/schema.prisma`, `src/lib/prisma.ts` | RZ-01, RZ-02, RZ-08, MT-04, GV-02 |
| **Rezervasyon & Müsaitlik** | `src/app/(site)/actions.ts`, `src/components/site/reservation-form.tsx`, `src/lib/crm/crm-service.ts` | RZ-01 - RZ-10, FM-01 - FM-04 |
| **Meta Lead Entegrasyonu** | `src/app/api/webhooks/meta/route.ts`, `src/app/api/webhooks/meta/sync/route.ts`, `src/lib/meta/*` | MT-01 - MT-13, GV-01, GV-05 |
| **Talepler & CRM** | `src/app/admin/talepler/*`, `src/app/admin/meta-leads/*`, `src/app/admin/actions.ts` | CR-01 - CR-07, FM-05, FM-06 |
| **Raporlar & Metrikler** | `src/app/admin/page.tsx`, `src/app/admin/meta-leads/meta-leads-client.tsx` | RP-01 - RP-07 |
| **Yönetim & Yetkilendirme** | `src/lib/auth.ts`, `src/app/admin/actions.ts`, `src/app/admin/icerik/*`, `src/app/admin/galeri/*` | YP-01 - YP-08, GV-03 |
| **Ön Yüz & Animasyon** | `src/app/(site)/*`, `src/components/animations/*`, `src/components/site/*`, `src/hooks/*` | ON-01 - ON-09 |
| **KVKK, Çerez & Takip** | `src/components/seo/meta-pixel.tsx`, `src/lib/meta/capi.ts`, `src/app/globals.css` | FM-01 - FM-07 |

---

## 2. DETAYLI TEST SENARYOSU DEĞERLENDİRMELERİ

### A) REZERVASYON VE MÜSAİTLİK

#### RZ-01: Eşzamanlı Rezervasyon Çakışması
- **Sonuç:** HATA
- **Kanıt:** `prisma/schema.prisma:170-193` & `src/lib/crm/crm-service.ts:133-146`
```prisma
model Reservation {
  id        String   @id @default(cuid())
  eventDate DateTime
  // (eventDate, hall, timeSlot) üzerinde @@unique kısıtı YOKTUR!
```
- **Ne olur:** İki müşteri aynı salonda aynı tarih ve aynı saat dilimi (ör. 20 Eylül Akşam) için aynı anda form gönderdiğinde veya Meta'dan eşzamanlı geldiğinde, veritabanı her iki rezervasyonu da onaylar. Aynı salona aynı saatte iki düğün satılmış olur (çifte rezervasyon faciası).
- **Önem:** KRİTİK
- **Önerilen düzeltme:** `prisma/schema.prisma` modeline `hall` ve `timeSlot` alanları eklenerek `@@unique([eventDate, hall, timeSlot])` bileşik benzersizlik kısıtı getirilmelidir. Ayrıca `submitReservation` ve `syncLeadToCalendar` işlemleri Prisma transaction (`prisma.$transaction`) ve satır düzeyinde kilitleme (pessimistic/serializable lock) ile atomik hale getirilmelidir.

---

#### RZ-02: Günlük Satış vs Slot (Öğlen/Akşam) Tutarlılığı
- **Sonuç:** HATA
- **Kanıt:** `prisma/schema.prisma:102` vs `src/lib/crm/crm-service.ts:109-122`
```typescript
// crm-service.ts slot bazlı çalışırken:
const slot = (lead.timeSlot || "NIGHT") as "DAY" | "NIGHT" | "FULL";
// schema.prisma'da BlockedDate tablosu tarihi tekil/tüm gün kilitler:
model BlockedDate {
  date DateTime @unique
```
- **Ne olur:** Yönetim takvimi gündüz ve akşam seansları olarak 2 ayrı etkinliğe izin verirken, veritabanındaki `BlockedDate` tablosu günü tamamen bloke eder (`@unique [date]`). Ön yüz rezervasyon formu slot seçtirmesine rağmen müsaitlik kontrolünü günün tamamı bazında yapar. Bir günün yalnızca gündüzü dolduğunda akşam seansı da ön yüzde haksız yere bloke görünür ve müşteri kaybedilir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** `BlockedDate` modeli `(date, slot, hall)` bileşenlerini içerecek şekilde güncellenmeli, tekil `@unique [date]` kaldırılmalı; ön yüz formu seçilen salon ve seansın (`DAY` / `NIGHT`) müsaitliğini bağımsız olarak sorgulamalıdır.

---

#### RZ-03: Dolu Güne Sunucu Tarafı Talep Engeli
- **Sonuç:** HATA
- **Kanıt:** `src/app/(site)/actions.ts:47-66` & `src/lib/crm/crm-service.ts:133-145`
```typescript
const isBlocked = await prisma.blockedDate.findFirst({
  where: { date: { gte: new Date(selectedDate.setHours(0,0,0,0)), lte: new Date(selectedDate.setHours(23,59,59,999)) } },
});
if (isBlocked) return { success: false, error: "Seçtiğiniz tarih doludur..." };
```
- **Ne olur:** Bir günde yalnızca 1 seans (ör. Gündüz) kapora alınarak satıldığında, `count < 2` olduğu için o gün `BlockedDate` tablosuna yazılmaz. Kötü niyetli bir kullanıcı veya doğrudan API çağıran biri dolu olan aynı seans için (Gündüz) talep gönderdiğinde sunucu kontrolü geçilir ve mükerrer talep sisteme işlenir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Sunucu tarafındaki `submitReservation` fonksiyonu sadece `BlockedDate` tablosuna değil; takvim kayıtlarına ve mevcut rezervasyonlara bakarak `(eventDate, timeSlot, hall)` çakışmasını bizzat doğrulamalıdır.

---

#### RZ-04: Geçmiş Tarih Kontrolü
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/validations.ts:17-23` & `src/components/site/reservation-form.tsx:111-114`
```typescript
eventDate: z.string().refine((val) => {
  const date = new Date(val);
  return date > new Date();
}, { message: "Etkinlik tarihi gelecekte olmalıdır" }),
```
- **Ne olur:** Ön yüzde HTML5 `min={tomorrow}` özniteliği dünün veya bugünün seçilmesini engeller; doğrudan API isteği atılsa dahi Zod şeması sunucuda isteği reddeder.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Mevcut kontrol geçerlidir. Ek olarak saat dilimi farkı için `date >= startOfTomorrow(Istanbul)` şeklinde normalize edilmesi faydalı olur.

---

#### RZ-05: Kapasite ve Negatif/Sıfır Kişi Sayısı Kontrolü
- **Sonuç:** HATA
- **Kanıt:** `src/lib/validations.ts:26-31`
```typescript
guestCount: z.coerce.number().int()
  .min(10, "Misafir sayısı en az 10 olmalıdır")
  .max(5000, "Misafir sayısı en fazla 5000 olabilir").optional(),
```
- **Ne olur:** Salon kapasiteleri Kristal Salon için 600, Kır Bahçesi için 300 kişi olmasına rağmen form 5000 kişiye kadar girişi kabul eder. Müşteri 1500 kişilik bir talep gönderir, sistem onaylar, salon sahibi müşteriyi aradığında kapasite yetersizliği nedeniyle mahcubiyet yaşar. CRM manuel ekleme ekranında ise hiçbir `max` sınırı yoktur.
- **Önem:** ORTA
- **Önerilen düzeltme:** Formda seçilen salona göre dinamik Zod `superRefine` kapasite kuralı eklenmeli; Kristal Salon için maksimum 600, Kır Bahçesi için maksimum 300 kişi sınırı zorunlu kılınmalıdır.

---

#### RZ-06: Opsiyonlu Günün Otomatik Süre Aşımı (TTL / Cron)
- **Sonuç:** EKSİK
- **Kanıt:** `src/lib/crm/crm-service.ts:20` & `src/app/admin/takvim/calendar-client.tsx:29`
```typescript
export type CalendarStatus = "BOOKED" | "OPTIONED" | "AVAILABLE";
```
- **Ne olur:** Takvimde bir gün "OPSİYONLU" olarak işaretlenir ancak opsiyonun ne zaman biteceğine dair bir tarih alanı (`optionExpiresAt`) ve süresi dolunca otomatik olarak "BOŞ" durumuna düşüren bir arka plan zamanlanmış görevi (cron) yoktur. Salon sahibi opsiyonu unutursa gün aylarca rezerve edilemez olarak kilitli kalır.
- **Önem:** ORTA
- **Önerilen düzeltme:** Takvim kayıtlarına `optionExpiresAt: DateTime` alanı eklenmeli ve her gece çalışan bir API/Cron rotası (`/api/cron/release-options`) ile süresi geçen opsiyonlar otomatik `AVAILABLE` statüsüne çekilmelidir.

---

#### RZ-07: Zaman Dilimi Kayması (UTC vs Yerel TSİ)
- **Sonuç:** HATA
- **Kanıt:** `src/app/(site)/actions.ts:49-55` & `src/lib/crm/crm-service.ts:134`
```typescript
const selectedDate = new Date(eventDate);
gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
lte: new Date(selectedDate.setHours(23, 59, 59, 999)),
```
- **Ne olur:** Node.js/Vercel sunucuları UTC (GMT+0) saat diliminde çalışır. Türkiye'den gece 23:30'da (TSİ / UTC+3) "2026-10-25" seçilerek gönderilen form, `setHours(0,0,0,0)` hesaplamasında UTC-3 saat farkıyla `2026-10-24T21:00:00Z` değerine döner. Sonuçta etkinlik takvimde 25 Ekim yerine bir önceki gün olan 24 Ekim olarak saklanır veya sorgulanır.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Tarih işlemleri için `date-fns-tz` kütüphanesi kullanılmalı; tüm tarihler `"Europe/Istanbul"` saat dilimine sabitlenmeli veya salt tarih formatında (`YYYY-MM-DD` string) saklanmalıdır.

---

#### RZ-08: Salon Silme Durumunda İlişkili Kayıtların Durumu (Orphan Data)
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:300-318`
```typescript
export async function deleteCustomHall(id: string) {
  let halls = JSON.parse(hallSetting.value);
  halls = halls.filter((h: any) => h.id !== id);
  await prisma.siteSetting.update({ where: { key: "admin_custom_halls" }, data: { value: JSON.stringify(halls) } });
```
- **Ne olur:** Salonlar veritabanında ilişkisel bir tablo (`model Hall`) olarak değil, JSON metni olarak saklanmaktadır. Bir salon silindiğinde ona bağlı takvim kayıtları ve CRM talepleri silinmez veya arşivlenmez. Takvimde ve CRM listesinde silinmiş salona ait yetim (orphan) kayıtlar kalır ve salon adını çözümlerken arayüzde boşluklar veya tanımsız hatalar oluşur.
- **Önem:** ORTA
- **Önerilen düzeltme:** Salonlar `Prisma` üzerinde gerçek bir ilişkisel tablo haline getirilmeli; fiziksel silme yerine `isArchived: boolean` bayrağı ile arşivleme yapılmalı ve ilişkili kayıtlar korunmalıdır.

---

#### RZ-09: İptal Edilen Talebin Takvim Gününü Boşa Çıkarmaması (Sessiz Başarısızlık)
- **Sonuç:** HATA
- **Kanıt:** `src/lib/crm/crm-service.ts:153-176`
```typescript
// Talebin durumu CANCELLED veya LOST olduğunda:
const filtered = events.filter((e) => e.leadId !== lead.id);
await saveCalendarEvents(filtered);
// DİKKAT: prisma.blockedDate tablosundan silme çağrısı HİÇ YAPILMAZ!
```
- **Ne olur:** Kapora alınmış bir düğün iptal edildiğinde yönetici durumu "İptal" veya "Kaybedildi" yapar. Kod takvim JSON'undan bu etkinliği kaldırır; **fakat `prisma.blockedDate` tablosundan silmeyi UNUTUR**. Sonuç olarak o gün ön yüz rezervasyon formunda kalıcı olarak "DOLU" görünmeye devam eder; salon sahibi günün boş olduğunu sansa da siteden hiç kimse o güne rezervasyon gönderemez.
- **Önem:** KRİTİK
- **Önerilen düzeltme:** `syncLeadToCalendar` fonksiyonu içine iptal durumunda `await prisma.blockedDate.deleteMany({ where: { date: targetDate } })` çağrısı eklenmelidir.

---

#### RZ-10: Aynı Kişiden (Aynı Telefon) Kısa Sürede Tekrar Eden Talep Kontrolü
- **Sonuç:** HATA
- **Kanıt:** `src/app/(site)/actions.ts:21-27`
```typescript
const isAllowed = checkRateLimit(`res_${ip}`, 5, 60 * 1000);
```
- **Ne olur:** Yalnızca IP bazlı bir sınırlama vardır. Mobil internet kullanıcılarının IP'si dinamik değiştiğinde veya VPN kullanıldığında, aynı telefon numarasıyla 10 saniye içinde arka arkaya 50 adet rezervasyon talebi gönderilebilir. CRM paneli aynı kişinin mükerrer kayıtlarıyla dolup taşar.
- **Önem:** ORTA
- **Önerilen düzeltme:** IP sınırlamasına ek olarak `checkRateLimit(`res_phone_${phone}`, 1, 10 * 60 * 1000)` eklenmeli; aynı telefon numarasından 10 dakika içinde en fazla 1 talep kabul edilmelidir.

---

### B) META LEAD ENTEGRASYONU

#### MT-01: Webhook GET Doğrulaması (Verify Token)
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/api/webhooks/meta/route.ts:12-25`
```typescript
if (mode === "subscribe" && token === verifyToken) {
  return new NextResponse(challenge, { status: 200 });
}
return NextResponse.json({ error: "Forbidden: Verification failed" }, { status: 403 });
```
- **Ne olur:** Meta Webhook paneli abonelik testi yaptığında doğru `verify_token` ile 200 ve `challenge` değerini alır; yanlış veya eksik token verildiğinde 403 Forbidden ile reddedilir.
- **Önem:** ORTA
- **Önerilen düzeltme:** Mevcut kod standartlara uygundur, değişiklik gerekmez.

---

#### MT-02: POST İmza Kontrolü Ham İstek Gövdesi (Raw Body)
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/api/webhooks/meta/route.ts:35-55`
```typescript
const rawBody = await request.text();
// rawBody doğrudan imzaya verilir, JSON parse edildikten sonra stringify EDİLMEZ:
const isValid = verifyMetaSignature(rawBody, signature);
```
- **Ne olur:** Meta'nın gönderdiği gövde doğrudan `request.text()` ile byte düzeyinde okunur. JSON serileştirme farklarından kaynaklanan imza doğrulama bozulmaları engellenmiştir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Mevcut kod standartlara uygundur.

---

#### MT-03: İmza Başlığı Kontrolü ve Sabit Zamanlı Karşılaştırma
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/meta/client.ts:88-93`
```typescript
const expectedBuf = Buffer.from(expectedHash, "hex");
const signatureBuf = Buffer.from(signatureHash, "hex");
if (expectedBuf.length !== signatureBuf.length) return false;
return crypto.timingSafeEqual(expectedBuf, signatureBuf);
```
- **Ne olur:** İmza başlığı (`X-Hub-Signature-256`) eksikse istek 401 ile anında reddedilir. `crypto.timingSafeEqual` kullanıldığı için zamanlama saldırılarına (timing attack) karşı tam koruma sağlanır.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Mevcut kod güvenlidir.

---

#### MT-04: Aynı `leadgen_id` İki Kez Gelirse Tek Kayıt mı Oluşuyor? (Yarış Durumu)
- **Sonuç:** HATA
- **Kanıt:** `src/lib/meta/lead-service.ts:218-224` & `prisma/schema.prisma:170`
```typescript
const existingLeads = await getAllMetaLeads();
const duplicate = existingLeads.find((l) => l.leadgenId === params.leadgenId);
if (duplicate) return { isDuplicate: true, lead: duplicate };
// DİKKAT: Veritabanında leadgenId için @unique kısıtı YOKTUR!
```
- **Ne olur:** Meta webhook'ları bazen aynı olayı saliseler farkıyla iki kez tetikler. İki istek de aynı anda `getAllMetaLeads()` okur; ikisi de kaydın henüz olmadığını görür ve Graph API'ye gider. Sonuçta veritabanına ve panele aynı reklam talebi 2 kez mükerrer olarak eklenir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** `Prisma` Reservation şemasına `metaLeadgenId String? @unique` eklenmeli; kayıt ekleme veritabanı düzeyindeki tekillik kısıtı (UPSERT veya unique constraint) ile korunmalıdır.

---

#### MT-05: Web ve Meta Lead'lerinin Telefon Normalizasyonu ile Eşleşmesi
- **Sonuç:** EKSİK
- **Kanıt:** `src/lib/crm/crm-service.ts:245-285`
```typescript
// Siteden gelenler ile Meta'dan gelenler birleştirilirken telefon eşleştirmesi yapılmaz:
const allLeads = [...websiteLeads, ...metaMapped];
```
- **Ne olur:** Bir gelin adayı öğlen Instagram reklamından form doldurur (`+90 532 123 45 67`), akşam ise web sitesine girip rezervasyon talebi gönderir (`05321234567`). Sistem iki kaydı normalize edip tek bir müşteri profili altında birleştiremez. İki farklı satış temsilcisi aynı müşteriyi birbirinden habersiz ayrı ayrı arar ve müşteri nezdinde kurumsal olmayan bir izlenim oluşur.
- **Önem:** ORTA
- **Önerilen düzeltme:** E.164 formatında (`+905XXXXXXXXX`) telefon normalizasyonu yapan bir birleştirme katmanı eklenmeli; aynı telefon numarasına sahip Meta lead'i ile Web rezervasyonu tek kart altında ilişkilendirilmelidir.

---

#### MT-06: Webhook Hızlı 200 Yanıtı ve Arka Plan Yeniden Deneme (Retry)
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/api/webhooks/meta/route.ts:80-120` & `src/lib/meta/queue.ts:80-125`
```typescript
enqueueLeadProcessing({ leadgenId, formId, ... });
// Meta'ya hemen 200 yanıtı dönülür:
return NextResponse.json({ received: true }, { status: 200 });
```
- **Ne olur:** Webhook Meta'ya 100ms içinde 200 döner (Meta'nın webhook'u timeout nedeniyle devre dışı bırakması önlenir). Arka plan işçisi Graph API çağrısını 3 kez üstel gecikmeyle (backoff) dener ve sonuçları `meta_sync_logs` tablosuna kaydeder.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Akış doğrudur. Tek risk kuyruğun Node.js in-memory olmasıdır; sunucu yeniden başlarsa işlenmemiş webhook kalmaması için kuyruk durumu veritabanında saklanmalıdır.

---

#### MT-07: Erişim Token'ı Süresi Dolduğunda Uyarı Sistemi
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/meta/client.ts:165-215` & `src/app/admin/meta-leads/meta-leads-client.tsx:750-770`
```typescript
const inspect = await inspectMetaToken();
if (!inspect.isValid || (inspect.expiresInDays && inspect.expiresInDays <= 7)) {
  // Arayüzde kırmızı uyarı bandı ve son yenileme butonu gösterilir
}
```
- **Ne olur:** Panel açıldığında Meta Debug Token API'si sorgulanır. Token'ın süresi dolmuşsa veya 7 günden az kalmışsa yöneticinin karşısına acil eylem gerektiren uyarı bildirimi çıkar.
- **Önem:** ORTA
- **Önerilen düzeltme:** Mevcut arayüz uyarısına ek olarak, token süresi dolduğunda yöneticiye otomatik e-posta bildirimi gönderilmesi faydalı olur.

---

#### MT-08: Değişen / Yeni Eklenen Form Sorularının Kaybolmadan Saklanması
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/meta/lead-service.ts:150-158` & `173-174`
```typescript
else {
  customFields.push({ name: rawName, label: item.label || rawName.replace(/_/g, " "), value: valueStr });
}
```
- **Ne olur:** Reklam yöneticisi Meta'da forma standart dışı sorular (örn: "Damat beyin mesleği", "Düğün bütçeniz") eklediğinde, kod standart alanları eşleştiremezse bile bu soruları `customFields` ve `rawFieldData` dizilerine JSON olarak yazar. Hiçbir veri kaybı yaşanmaz.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Mevcut kod esnek ve sağlamdır.

---

#### MT-09: Telefon veya Adı Boş Gelen Lead'lerin Durumu
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/meta/lead-service.ts:165-166`
```typescript
fullName: fullName || "İsimsiz Meta Müşterisi",
phone: phone || "-",
```
- **Ne olur:** Meta kullanıcısı adını veya telefonunu gizlemiş/boş bırakmışsa sistem hata verip kaydı düşürmez; güvenli varsayılan metinlerle kaydı panele işler.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### MT-10: "Senkronize Et" Butonu Mükerrer Kayıt Oluşturuyor mu?
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/api/webhooks/meta/sync/route.ts:85-105`
```typescript
for (const raw of formLeads) {
  const result = await ingestMetaLead({ leadgenId: raw.id, ... });
  if (result.isDuplicate) skippedCount++; else syncedCount++;
}
```
- **Ne olur:** Yönetici "Senkronize Et" butonuna bastığında çekilen tüm lead'ler `ingestMetaLead` filtresinden geçer; mevcut olanlar atlanır (`skippedCount`), mükerrer kayıt basılmaz.
- **Önem:** ORTA
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### MT-11: Meta Test Lead'lerinin İstatistiklerden Ayrılması
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/meta-leads/meta-leads-client.tsx:455-465`
```typescript
const stats = useMemo(() => {
  const total = leads.length; // leads içinde isTest: true olanlar da var!
  const todayCount = leads.filter(l => isToday(l.createdAt)).length;
```
- **Ne olur:** Meta Lead Ads Test Tool ile gönderilen deneme lead'leri `isTest: true` rozeti alır ancak üst istatistik kartlarındaki "Toplam Talep", "Bugün Gelen" ve "Dönüşüm Oranı" hesaplarına dahil edilir. Gerçek müşteri metrikleri test verileriyle kirlenir.
- **Önem:** ORTA
- **Önerilen düzeltme:** `leads.filter(l => !l.isTest)` filtresi istatistik hesaplama fonksiyonunun (`useMemo`) en başına eklenmelidir.

---

#### MT-12: Sabit Kodlanmış Hassas Veri vs Ortam Değişkenleri (.env)
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/meta/client.ts:35-50`
```typescript
const graphVersion = process.env.META_GRAPH_VERSION || "v21.0";
const appSecret = process.env.META_APP_SECRET || dbConfig.appSecret;
```
- **Ne olur:** Graph API sürümü, App Secret ve Token kod içine yazılmamıştır; `.env` veya panel üzerinden şifreli kaydedilen ayarlardan okunur.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### MT-13: Kampanya / Reklam Adı Çekilemezse Lead Oluşuyor mu?
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/meta/lead-service.ts:250-256`
```typescript
campaignName: names.campaignName || (leadDetails.campaign_id ? `Kampanya #${leadDetails.campaign_id}` : "Meta Lead Reklamı"),
adName: names.adName || (leadDetails.ad_id ? `Reklam #${leadDetails.ad_id}` : "Instagram/Facebook Lead"),
```
- **Ne olur:** Graph API reklam adı sorgusu rate-limit veya yetki hatası alsa dahi müşteri talebi engellenmez; otomatik ID etiketleriyle CRM'e kaydedilir.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

### C) TALEPLER (CRM) VE DURUMLAR

#### CR-01: Durum Geçişlerinde Mantık Kuralı Doğrulaması (State Machine)
- **Sonuç:** EKSİK
- **Kanıt:** `src/app/admin/actions.ts:950-975` & `src/app/admin/meta-leads/actions.ts:135-165`
```typescript
export async function updateLeadStatus(id: string, status: string, notes?: string) {
  // Gelen 'status' stringi doğrudan güncellenir, hiçbir durum geçiş kuralı kontrolü YOKTUR!
  await prisma.reservation.update({ where: { id }, data: { status: status as any } });
```
- **Ne olur:** "İptal Edildi" veya "Kaybedildi" olarak işaretlenmiş bir talep tek bir tıkla hiçbir denetim olmadan "Kapora Alındı"ya geçirilebilir veya tam tersi yapılabilir. Satış sürecinde mantık dışı durum sıçramaları engellenemez.
- **Önem:** ORTA
- **Önerilen düzeltme:** Geçerli durum geçiş matrisi (`Yeni -> İletişime Geçildi -> Randevu Verildi -> Teklif Sunuldu -> Kapora Alındı / Kaybedildi`) tanımlanmalı ve yetkisiz sıçramalar sunucuda engellenmelidir.

---

#### CR-02: Durum Değişikliği Geçmişi (Audit Trail: Kim, Ne Zaman, Eski -> Yeni)
- **Sonuç:** HATA
- **Kanıt:** `src/lib/meta/lead-service.ts:320-330` ve `src/app/admin/actions.ts:950-975`
```typescript
// Sadece Meta lead'lerinde vardır ancak eski durum kaydedilmez:
lead.statusHistory.unshift({ status: newStatus, changedAt: new Date().toISOString(), changedBy: user.name });
// Standart web sitesi rezervasyonlarında (prisma.reservation) ise HİÇBİR geçmiş tutulmaz!
```
- **Ne olur:** Bir yönetici web sitesinden gelen bir rezervasyonun durumunu değiştirdiğinde, önceki durumun ne olduğu, kimin ne zaman değiştirdiği hiçbir yere kaydedilmez. İki satış danışmanı arasında "Bu kaydı kim iptale aldı?" tartışması çıktığında geriye dönük hesap verilebilirlik sağlanamaz.
- **Önem:** ORTA
- **Önerilen düzeltme:** `prisma/schema.prisma`'ya `ReservationStatusLog` modeli eklenmeli; `(reservationId, oldStatus, newStatus, changedBy, changedAt, reason)` alanlarıyla kalıcı olarak kaydedilmelidir.

---

#### CR-03: Aynı Talebi Eşzamanlı Düzenleyen İki Yönetici (Optimistic Locking)
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:950-975` & `src/lib/local-store.ts:60-95`
```typescript
// İyimser kilit mekanizması (version / updatedAt karşılaştırması) YOKTUR:
await prisma.reservation.update({ where: { id }, data: { status, ... } });
```
- **Ne olur:** A yöneticisi bir müşteriye "Müşteri 100.000 TL teklifi kabul etti" notunu yazarken, B yöneticisi aynı anda müşteriyi arayıp "Ulaşılamadı" durumuna alırsa, en son kaydeden yöneticinin işlemi diğerinin yazdığı tüm notları ve durumu sessizce ezer. Veri kaybı fark edilmez.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** `Reservation` tablosuna `version: Int @default(1)` eklenmeli; güncelleme sırasında `where: { id, version: currentVersion }` sorgusu yapılarak çakışma durumunda kullanıcıya "Bu kayıt başka bir yönetici tarafından güncellendi" uyarısı verilmelidir.

---

#### CR-04: Filtre, Arama ve Boş Sonuç Ekranı
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/admin/talepler/crm-client.tsx:210-250`
```typescript
{filteredLeads.length === 0 && (
  <div className="text-center py-16 text-text-muted">Aramanızla eşleşen talep bulunamadı.</div>
)}
```
- **Ne olur:** Arama kutusuna olmayan bir isim yazıldığında veya tarih filtresinde kayıt çıkmadığında sayfa düzeni bozulmaz; şık bir boş durum mesajı gösterilir.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### CR-05: Excel / CSV Dışa Aktarma ve CSV Injection Koruması
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/meta-leads/meta-leads-client.tsx:505-535`
```typescript
const rows = leads.map((l) => [
  `"${l.fullName || ""}"`,
  `"${l.phone || ""}"`,
  `"${l.email || ""}"`,
  // Hücre başlangıcındaki =, +, -, @ karakterleri TEMİZLENMEMEKTEDİR!
]);
```
- **Ne olur:** Bir müşteri adını `=cmd|' /C calc'!A0` veya `@SUM(1+1)` olarak girdiğinde, salon sahibi bu CSV dosyasını indirip Excel'de açtığı anda Excel zararlı komut çalıştırabilir (Formula/CSV Injection). Ayrıca ana CRM sayfasında (`/admin/talepler`) CSV dışa aktarma özelliği hiç bulunmamaktadır.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** CSV'ye yazılan tüm metin hücrelerinde başta bulunan `=`, `+`, `-`, `@`, `\t`, `\r` karakterlerinin önüne tek tırnak (`'`) eklenerek formül çalıştırması engellenmeli; `/admin/talepler` sayfasına da CSV dışa aktarma fonksiyonu eklenmelidir.

---

#### CR-06: Silinen Taleplerin İstatistiklere Etkisi
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:1000-1012`
```typescript
export async function deleteLead(id: string) {
  await prisma.reservation.delete({ where: { id } }).catch(() => {});
  // DİKKAT: 'reservations' local-store dosyasından silme işlemi UNUTULMUŞTUR!
  const curr = await getSafeSetting("admin_crm_leads");
```
- **Ne olur:** Bir talep silindiğinde veritabanından ve `admin_crm_leads` ayarından silinir; fakat sistemin yedek depolama dosyası olan `reservations` JSON'undan silinmez. Veritabanı kesintisinde veya dashboard sayımı bu dosyadan okuduğunda silinmiş kayıtlar hâlâ aktif talep olarak görünmeye devam eder.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** `deleteLead` fonksiyonu içine `getSafeSetting("reservations")` okuyup ilgili ID'yi filtreleyerek tekrar kaydeden temizleme bloğu eklenmelidir.

---

#### CR-07: Not ve Detay Ekranlarında XSS Koruması
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/admin/talepler/crm-client.tsx:500-560`
```typescript
<p className="text-xs text-text-secondary whitespace-pre-wrap">{note.text}</p>
```
- **Ne olur:** Notlara veya isim alanına `<script>alert('xss')</script>` gibi zararlı kodlar yazılsa dahi React JSX motoru metni doğrudan string olarak ekrana basar (`dangerouslySetInnerHTML` kullanılmamıştır); script çalıştırılamaz.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

### D) RAKAMLAR VE RAPORLAR

#### RP-01: Dönüşüm Oranının Pay ve Paydası / İstatistik Güvenilirliği
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/page.tsx:28-85`
```typescript
// Dashboard'daki veriler:
const [reservations, metaLeads] = await Promise.all([
  prisma.reservation.findMany({ take: 10, orderBy: { createdAt: "desc" } }), // YALNIZCA 10 KAYIT!
```
- **Ne olur:** Ana dashboard ekranı veritabanından yalnızca 10 kayıt (`take: 10`) çekmektedir! Toplam dönüşüm oranı ve istatistik kartları ise gerçek matematiksel hesaplama yerine sabit yüzdelerle (%58, %28, %14) hesaplanmaktadır. Salon sahibi gerçek müşteri dönüşüm oranını hiçbir zaman doğru göremez.
- **Önem:** KRİTİK
- **Önerilen düzeltme:** `take: 10` kısıtı kaldırılmalı; `prisma.reservation.groupBy` veya `aggregate` kullanılarak gerçek toplam talep, kapora alınanlar, iptaller üzerinden net dönüşüm oranı hesaplanmalıdır.

---

#### RP-02: Sıfıra Bölme Güvenliği (Division by Zero)
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/admin/meta-leads/meta-leads-client.tsx:465`
```typescript
const conversionRate = total > 0 ? ((wonCount / total) * 100).toFixed(1) : "0.0";
```
- **Ne olur:** Sistemde hiç lead veya rezervasyon olmadığında sıfıra bölme hatası (`NaN` veya `Infinity`) oluşmaz; sayfa temiz şekilde `0.0%` gösterir.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### RP-03: Kapora Alındıktan Sonra İptal Edilirse Sayacın Güncellenmesi
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/meta-leads/meta-leads-client.tsx:150-180`
```typescript
// Satır durumu güncellenir ancak üst özet sayacı (summary counters) sayfa F5 yapılmadan güncellenmez:
setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
```
- **Ne olur:** Yönetici listedeki bir kaydı "Kapora Alındı"dan "İptal Edildi" durumuna çektiğinde alttaki satır güncellenir fakat en üstteki "Kazanılan Talepler" ve "Ciro" sayaçları hemen düşmez; sayfa yenilenene kadar eski rakamı gösterir.
- **Önem:** ORTA
- **Önerilen düzeltme:** İstatistik nesnesi `leads` state'ine bağlı reaktif bir `useMemo` ile anlık güncellenmelidir.

---

#### RP-04: Saat Dilimi ve Günlük / Haftalık Sayım Eşleşmesi
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:890-930`
```typescript
const now = new Date();
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
```
- **Ne olur:** Sunucu UTC saat diliminde çalıştığında, Meta Ads Manager ise Türkiye saat diliminde (GMT+3) raporlama yaptığında; gece 00:00 ile 03:00 arasında gelen kayıtlar Meta'da bugüne, panelde ise düne sayılır. Raporlar birbiriyle uyuşmaz.
- **Önem:** ORTA
- **Önerilen düzeltme:** Günlük kırılımlar `Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul" })` kullanılarak Türkiye gün başlangıcına (00:00:00 TSİ) göre gruplanmalıdır.

---

#### RP-05: Kampanya Dağılım Toplamı vs Genel Toplam Tutarlılığı
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/page.tsx:68-80`
```typescript
const sources = [
  { name: "Web Sitesi Formu", percentage: 58 },
  { name: "Instagram / Meta Ads", percentage: 28 },
  { name: "Telefon & Doğrudan", percentage: 14 },
]; // Statik yazılmış oranlar!
```
- **Ne olur:** Gösterge panelindeki kaynak dağılımı gerçek veritabanı kayıtlarından hesaplanmaz; sabit 58%, 28%, 14% olarak ekrana basılır. Gerçekte gelen kayıt sayısı ne olursa olsun grafik hiç değişmez.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** `prisma.reservation` ve `meta_leads` üzerindeki `source` alanları dinamik olarak sayılıp yüzdelere dönüştürülmelidir.

---

#### RP-06: Meta Reklam Sayısı ile Veritabanı Sayısı Arasındaki Fark Açıklaması
- **Sonuç:** EKSİK
- **Kanıt:** `src/app/admin/meta-leads/page.tsx`
- **Ne olur:** Meta Ads Manager panelinde 50 form doldurma görünürken panelde 46 lead çekilmiş olabilir (Meta'nın sildiği spam formlar veya test lead'leri nedeniyle). Panelde bu 4 kayıtlık farkın neden kaynaklandığını açıklayan bir mutabakat göstergesi yoktur.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Meta API `leads_count` metriği ile yerel veritabanı adedi karşılaştırılıp bilgi notu olarak gösterilmelidir.

---

#### RP-07: Para Birimi ve Kuruş Yuvarlama Tutarlılığı
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/utils.ts:45-57` & `prisma/schema.prisma:54`
```typescript
export function formatPrice(price: number | string | null | undefined): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(numPrice);
}
```
- **Ne olur:** Tüm fiyatlar Türk Lirası para biriminde ve standart formatta ekrana basılır; veritabanında `Decimal(10,2)` tipi kullanılarak kuruş yuvarlama hataları engellenmiştir.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

### E) YÖNETİM PANELİ VE YETKİ

#### YP-01: Admin Rotaları ve Server Action Oturumsuz Erişim Açığı
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:16-25`
```typescript
export async function assertAuth() {
  const session = await auth();
  if (!session?.user) {
    // ÇOK TEHLİKELİ GELİŞTİRİCİ AÇIĞI:
    return { id: "dev-admin", name: "Admin", email: "admin@elmiradavet.com", role: "ADMIN" };
    // throw new Error("Unauthorized: Bu işlem için giriş yapmalısınız");
  }
  return session.user;
}
```
- **Ne olur:** Giriş yapmamış herhangi bir saldırgan, tarayıcı konsolundan veya cURL ile admin Server Action fonksiyonlarını çağırdığında sistem onu doğrudan **ADMIN** olarak kabul eder! Oturumu olmayan herkes kullanıcı silebilir, fiyat değiştirebilir ve müşteri kayıtlarını görüntüleyebilir.
- **Önem:** KRİTİK
- **Önerilen düzeltme:** `assertAuth` fonksiyonundaki sahte kullanıcı döndüren fallback derhal silinmeli; `if (!session?.user) throw new Error("Unauthorized")` koşulu tavizsiz şekilde devreye alınmalıdır.

---

#### YP-02: EDITOR Rolünün Kullanıcı Yönetimi ve Ayarlara Erişimi (RBAC İhlali)
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:1064-1160`
```typescript
export async function createUser(data: { name: string; email: string; role: Role }) {
  await assertAuth(); // SADECE assertAuth() ÇAĞRILIR, user.role === "ADMIN" KONTROLÜ YOKTUR!
  const passwordHash = await hash(data.password, 12);
  return prisma.user.create({ ... });
}
```
- **Ne olur:** İçerik editörü (`EDITOR` rolü) olan bir personel, arayüzde linki gizlense dahi doğrudan API çağrısı yaparak yeni kullanıcı ekleyebilir, mevcut yöneticileri silebilir veya site ayarlarını değiştirebilir. Rol tabanlı yetki kontrolü (RBAC) sunucu tarafında uygulanmamıştır.
- **Önem:** KRİTİK
- **Önerilen düzeltme:** Kritik eylemlerin (`createUser`, `deleteUser`, `updateUserRole`, `saveSiteSettings`) en başına `const user = await assertAuth(); if (user.role !== "ADMIN") throw new Error("Forbidden: Yalnızca ADMIN yetkisi gerekir");` kontrolü eklenmelidir.

---

#### YP-03: Kullanıcının Kendi Rolünü Yükseltmesi (Privilege Escalation)
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:1120-1135`
```typescript
export async function updateUserRole(userId: string, newRole: Role) {
  await assertAuth(); // Çağıranın ADMIN olup olmadığına bakılmaz!
  await prisma.user.update({ where: { id: userId }, data: { role: newRole } });
```
- **Ne olur:** `EDITOR` yetkisindeki bir kullanıcı, `updateUserRole(kendi_id_si, "ADMIN")` çağrısını tetikleyerek kendi hesabını tek saniyede tam yetkili ADMIN seviyesine yükseltebilir.
- **Önem:** KRİTİK
- **Önerilen düzeltme:** `updateUserRole` eyleminde işlemi yapan kullanıcının `ADMIN` olduğu doğrulanmalı ve kullanıcının kendi yetkisini değiştirmesi engellenmelidir.

---

#### YP-04: Taslak Durumundaki Salon / Paket / Menülerin Ön Yüzde Durumu
- **Sonuç:** HATA
- **Kanıt:** `src/app/(site)/salonlar/page.tsx:1-45` & `src/app/(site)/salonlar/[slug]/page.tsx:1-35`
```typescript
import { mockHalls } from "@/lib/mock-data";
// ...
{mockHalls.map((hall) => (<HallCard key={hall.id} hall={hall} />))}
```
- **Ne olur:** Ön yüzdeki `/salonlar` ve `/salonlar/[slug]` sayfaları doğrudan `mockHalls` dosyasını import etmektedir. Yönetim panelinden bir salon taslağa alınsa dahi (veya yeni salon eklense dahi) ön yüz veritabanını hiç okumadığı için taslak salonlar ya da güncellemeler sitede kontrol edilemez; sistem tamamen statik mock veride kilitlidir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Ön yüz sayfaları `prisma.hall.findMany({ where: { isActive: true } })` veya `admin_custom_halls` ayarından yalnızca yayında olanları (`isActive === true`) çekecek şekilde dinamikleştirilmelidir.

---

#### YP-05: Panelde Kaydedilen İçeriğin Ön Yüze Anında Yansıması (Önbellek & Revalidate)
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:290-292` ve `src/app/(site)/salonlar/page.tsx:1`
```typescript
revalidatePath("/salonlar");
// revalidatePath çağrılsa bile /salonlar sayfası veritabanını değil mock-data.ts'yi okur!
```
- **Ne olur:** Yönetici panelden salon fiyatını, kapasitesini veya görsellerini günceller ve "Kaydedildi" mesajı alır. Ön yüze gittiğinde sayfa yenilense bile değişiklikler görünmez çünkü ön yüz sayfaları statik dosyadan beslenmektedir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** YP-04 düzeltilerek sayfalar dinamik veri kaynağına bağlanmalı ve Server Action'lardaki `revalidatePath` çağrılarının gerçek veriyi tazelemesi sağlanmalıdır.

---

#### YP-06: Sürükle-Bırak Sıralamanın Sunucuya Kaydedilmemesi (Sessiz Kayıp)
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/galeri/gallery-client.tsx:160-170` & `src/app/admin/icerik/content-manager.tsx:302-313`
```typescript
// gallery-client.tsx:
const handleMove = (index: number, direction: "up" | "down") => {
  // Yalnızca React in-memory state güncellenir:
  setImages(copy);
  toast.success("Görsel sıralaması güncellendi"); // SUNUCUYA HİÇBİR İSTEK ATILMAZ!
};
```
- **Ne olur:** Yönetici galeri fotoğraflarını veya paketleri saatlerce yukarı/aşağı butonlarıyla sıralar ve ekranda "Sıralama güncellendi!" yeşil bildirimi çıkar. Ancak F5 yapıldığında veya başka bir bilgisayardan girildiğinde tüm sıralama eski haline döner! Sunucuya hiçbir kayıt gitmemektedir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** `handleMove` fonksiyonu içine `await reorderGalleryImages(newOrder)` Server Action çağrısı eklenmeli ve yeni `sortOrder` değerleri veritabanına yazılmalıdır.

---

#### YP-07: Görsel Yüklemede Tür/Boyut Kontrolü ve Yetim Medyalar
- **Sonuç:** EKSİK
- **Kanıt:** `src/app/admin/galeri/gallery-client.tsx:84-125` & `src/lib/cloudinary.ts:23-58`
```typescript
const urls = bulkUrls.split("\n").map(u => u.trim()).filter(u => u.startsWith("http"));
// Doğrudan dosya binary upload'u YOKTUR, sadece harici URL yapıştırma vardır.
```
- **Ne olur:** Panelde gerçek bir dosya yükleme (drag-drop binary upload) yoktur; kullanıcı sadece metin URL yapıştırabilmektedir. `src/lib/cloudinary.ts` dosyası yazılmış ancak kodda hiçbir yerde çağrılmamaktadır. Bir görsel silindiğinde depodaki fiziksel dosya silinmez (yetim dosya kalır).
- **Önem:** ORTA
- **Önerilen düzeltme:** Gerçek dosya yükleme için Cloudinary entegrasyonu bağlanmalı; dosya türü (`image/jpeg`, `image/png`, `image/webp`), boyut sınırı (maks 5MB) kontrol edilmeli ve silme işlemlerinde `deleteFromCloudinary` çağrılmalıdır.

---

#### YP-08: İşlem Geçmişinin (ActivityLog) 80 Kayıt Sonra Kalıcı Silinmesi
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:45-75`
```typescript
logs.unshift(logEntry);
if (logs.length > 80) logs = logs.slice(0, 80); // 80'DEN ESKİ LOGLAR SİLİNİR!
await prisma.siteSetting.upsert({ where: { key: "admin_audit_logs" }, ... });
```
- **Ne olur:** İşlem geçmişi bağımsız bir tabloda değil, tek bir JSON sütununda tutulur ve 80 kayıtla sınırlandırılmıştır. Yoğun bir günde 80 işlem yapıldıktan sonra dünün tüm silme, rol değiştirme ve durum güncelleme geçmişi **kalıcı olarak silinir**. Yasal ve güvenlik denetimlerinde iz sürülemez.
- **Önem:** ORTA
- **Önerilen düzeltme:** `ActivityLog` modeli Prisma'da append-only (yalnızca eklemeli, silinemez) bağımsız bir tablo yapılmalı; log rotasyonu en az 1 yıl saklanacak şekilde ayarlanmalıdır.

---

### F) ÖN YÜZ VE ANİMASYON

#### ON-01: Türkçe Karakter ve Slug Üretimi Hataları (i/İ, ı/I, ç)
- **Sonuç:** HATA
- **Kanıt:** `src/lib/utils.ts:16-29` & `src/app/admin/icerik/content-manager.tsx:136`
```typescript
// utils.ts turkishMap içinde BÜYÜK 'I' EKSİKTİR:
const turkishMap = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u" };
// content-manager.tsx ise slugify'ı hiç çağırmaz:
slug: hallForm.name.toLowerCase().replace(/\s+/g, "-") // "KIR BAHÇESİ" -> "kır-bahçesi" (ç kalır!)
```
- **Ne olur:** `turkishMap` içinde büyük `I` harfi unutulduğu için `IŞIKLI SALON` slug'a çevrilirken hata verir. Ayrıca içerik yöneticisi `slugify` fonksiyonu yerine doğrudan `.toLowerCase()` kullandığı için "Kır Bahçesi" eklendiğinde URL `kır-bahçesi` (Türkçe 'ç' ve 'ı' harfleriyle) oluşur ve kırık bağlantılara yol açar.
- **Önem:** ORTA
- **Önerilen düzeltme:** `turkishMap` tablosuna `I: "i"` eklenmeli; tüm slug üretimleri tek merkezden `slugify(name.toLocaleLowerCase("tr-TR"))` ile yapılmalıdır.

---

#### ON-02: Veritabanı Boş Olduğunda Boş Çerçeve Görünümü
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/(site)/page.tsx:170-180`
```typescript
const activePackages = featuredPackages && featuredPackages.length > 0 ? featuredPackages : mockPackages;
const activeImages = recentImages && recentImages.length > 0 ? recentImages : mockGalleryImages;
```
- **Ne olur:** Veritabanında hiç paket, galeri resmi veya yorum olmasa dahi sayfa boş çerçeve olarak kalmaz; zengin mock verilerine sorunsuz şekilde düşerek görsel tasarımı korur.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### ON-03: Uzun Metin ve Boş Görselde Kart Tasarımı Bozulması
- **Sonuç:** HATA
- **Kanıt:** `src/components/site/hall-card.tsx:32-37` & `60-64`
```typescript
<Image src={hall.imageUrl} alt={`${hall.name}...`} fill className="object-cover" />
<h3 className="text-2xl sm:text-3xl font-heading text-cream">{hall.name}</h3>
```
- **Ne olur:** `hall.name` ve `hall.description` üzerinde `line-clamp` sınırı yoktur; yönetici uzun bir açıklama girdiğinde kartlar asimetrik uzar. Daha kötüsü, `hall.imageUrl` boş string `""` olduğunda Next.js Image bileşeni `Failed to parse src` hatası fırlatarak tüm sayfa render'ını düşürür.
- **Önem:** ORTA
- **Önerilen düzeltme:** Başlıklara `line-clamp-1`, açıklamalara `line-clamp-3` eklenmeli; `hall.imageUrl` için varsayılan fallback placeholder görseli tanımlanmalıdır.

---

#### ON-04: prefers-reduced-motion Erişilebilirlik Desteği
- **Sonuç:** GEÇER
- **Kanıt:** `src/components/providers/motion-provider.tsx:18` & `src/hooks/use-reduced-motion.ts:15`
```typescript
<MotionConfig reducedMotion="user">
// globals.css:
@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; } }
```
- **Ne olur:** Kullanıcının işletim sisteminde hareket azaltma açıksa Framer Motion, GSAP ve CSS animasyonları anında durur; video oynatılmaz, statik poster gösterilir.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### ON-05: Yumuşak Kaydırma (Lenis) ile Modal / Menü Çakışması
- **Sonuç:** HATA
- **Kanıt:** `src/components/providers/smooth-scroll-provider.tsx:44-55` & `src/components/site/reservation-form.tsx:408-449`
```typescript
// Modal açıldığında Lenis durdurulmaz veya data-lenis-prevent kullanılmaz:
<div className="py-4 overflow-y-auto text-xs ..."> // data-lenis-prevent YOKTUR!
```
- **Ne olur:** Rezervasyon formundaki KVKK aydınlatma metni modalı açıldığında, kullanıcı modal içindeki uzun metni aşağı kaydırmak için fare tekerleğini çevirdiğinde Lenis ana sayfayı arkadan kaydırmaya devam eder. Kullanıcı modalı kapatınca sayfanın en altına sürüklendiğini görür.
- **Önem:** ORTA
- **Önerilen düzeltme:** KVKK modalı, mobil menü ve açılır pencerelerin kaydırılabilir konteynerlerine `data-lenis-prevent` özniteliği eklenmelidir.

---

#### ON-06: Sayfa Geçiş Animasyonunda Geri Tuşu ve Doğrudan Giriş
- **Sonuç:** GEÇER
- **Kanıt:** `src/components/animations/page-transition.tsx:24-36`
```typescript
<m.div key={pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
```
- **Ne olur:** Sayfaya doğrudan linkle girildiğinde veya tarayıcının geri/ileri tuşlarına basıldığında donma ya da beyaz ekran olmaz; `key={pathname}` ile pürüzsüz geçiş sağlanır.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### ON-07: Sayaç Animasyonunun Tekrar Tetiklenmesi
- **Sonuç:** GEÇER
- **Kanıt:** `src/components/animations/counter.tsx:35`
```typescript
const isInView = useInView(ref, { once: true, amount: 0.1 });
```
- **Ne olur:** `{ once: true }` yapılandırması sayesinde sayaç animasyonu yalnızca ilk kez ekrana girdiğinde çalışır; sayfa aşağı yukarı kaydırıldığında tekrar tekrar çalışıp kullanıcıyı rahatsız etmez.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### ON-08: Özel İmlecin (Custom Cursor) Dokunmatik Cihazlarda Durumu
- **Sonuç:** GEÇER
- **Kanıt:** `src/components/ui/custom-cursor.tsx:19-22`
```typescript
const isFinePointer = window.matchMedia("(pointer: fine)").matches;
if (!isFinePointer || prefersReduced) return;
```
- **Ne olur:** Dokunmatik ekranlı telefon ve tabletlerde `(pointer: fine)` false döner ve bileşen hiçbir DOM elemanı üretmeden `null` döner; mobil dokunma deneyimini bozmaz.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### ON-09: Hero Video Yüklenemezse Yedek (Poster) Gösterimi
- **Sonuç:** GEÇER
- **Kanıt:** `src/components/site/hero-mask.tsx:82` & `94-97`
```typescript
<Image src={posterUrl} priority sizes="100vw" style={{ opacity: videoLoaded && !hasVideoError ? 0.35 : 1 }} />
// video onError:
onError={() => { setHasVideoError(true); setVideoLoaded(false); }}
```
- **Ne olur:** Video bağlantısı koptuğunda veya format desteklenmediğinde video otomatik gizlenir ve yüksek çözünürlüklü LCP poster görseli tam görünürlükle kalır; siyah ekran oluşmaz.
- **Önem:** DÜŞÜK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

### G) FORM, KVKK VE BİLDİRİM

#### FM-01: Telefon, E-posta ve Ad Alanlarının Sunucu Doğrulaması
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/validations.ts:5-39` & `src/app/(site)/actions.ts:30-37`
```typescript
const parsed = reservationSchema.safeParse(data);
if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };
```
- **Ne olur:** Kullanıcı tarayıcıdaki HTML kontrollerini devre dışı bıraksa dahi Zod şeması sunucuda telefon formatını (`/^(\+90|0)?[1-9][0-9]{9}$/`), e-postayı ve ad-soyadı kontrol eder; geçersiz veriler sunucuda reddedilir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### FM-02: KVKK Onay Kutusu ve Metin Sürümü Denetimi
- **Sonuç:** HATA
- **Kanıt:** `src/lib/validations.ts:36-38` & `src/app/(site)/actions.ts:90-101`
```typescript
kvkkConsent: z.literal(true, { message: "KVKK aydınlatma metnini onaylamanız gerekmektedir" }),
// Ancak kaydedilen metinde versiyon numarası YOKTUR:
consentText: `KVKK Aydınlatma Metni kabul edildi.${data.etkConsent ? " ETK onayı verildi." : ""}`,
```
- **Ne olur:** Onaysız form sunucuda reddedilir ve onay zamanı kaydedilir; ancak onaylanan metnin hangi sürüm olduğu (örn. `v1.2 - 2026/01`) veya metin özeti (hash) kaydedilmez. Yasal bir uyuşmazlıkta kullanıcının o tarihte hangi metni onayladığı ispatlanamaz.
- **Önem:** ORTA
- **Önerilen düzeltme:** `KvkkConsent` modeline `textVersion: String @default("v1.0")` ve `policyHash: String` alanları eklenmelidir.

---

#### FM-03: Çift Tıklama ve Bot Koruması
- **Sonuç:** GEÇER
- **Kanıt:** `src/components/site/reservation-form.tsx:391-395` & `src/app/(site)/actions.ts:21-27`
```typescript
<button type="submit" disabled={loading}>
// Sunucuda:
const isAllowed = checkRateLimit(`res_${ip}`, 5, 60 * 1000);
```
- **Ne olur:** İstemcide form gönderilirken buton anında `disabled` duruma geçer (çift tıklama engellenir). Sunucuda ise aynı IP'den dakikada 5'ten fazla istek engellenir.
- **Önem:** ORTA
- **Önerilen düzeltme:** Botlara karşı gizli bir bal küpü (honeypot input) alanı eklenmesi korumayı daha da güçlendirecektir.

---

#### FM-04: Bildirim / Servis Çöküşünde Talebin Kaybolma Riski
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/(site)/actions.ts:73-105` & `141-159`
```typescript
const reservation = await prisma.reservation.create({ data: { ... } });
// Meta CAPI veya harici servisler hata verse bile ana işlem tamamlanmıştır:
sendMetaConversionsApiEvent(...).catch((err) => console.error("CAPI error:", err));
return { success: true, reservationId };
```
- **Ne olur:** Talep önce ana veritabanına ve yerel güvenli depoya (`local-store`) yazılır. WhatsApp veya Meta CAPI çökse bile müşteri talebi asla kaybolmaz ve kullanıcıya başarı yanıtı döner.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### FM-05: Loglara Kişisel Veri (PII) Yazılma Riski
- **Sonuç:** GEÇER
- **Kanıt:** `src/lib/meta/capi.ts:74-75` & `120-140`
```typescript
const hashedEmail = hashMetaField(event.userData.email);
const hashedPhone = hashMetaPhone(event.userData.phone);
console.log(`[Meta CAPI Success] Sent ${event.eventName} (Event ID: ${event.eventId})`);
```
- **Ne olur:** Müşterinin telefon ve e-posta bilgileri Meta'ya SHA-256 ile özetlenerek gönderilir; sunucu loglarına veya hata izleme konsoluna müşterinin açık telefon/e-posta bilgisi basılmaz.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### FM-06: Veri Saklama Süresi ve Yetim Kişisel Veriler (KVKK İhlali)
- **Sonuç:** HATA
- **Kanıt:** `src/app/admin/actions.ts:1020-1054`
```typescript
// prisma.reservation ve admin_crm_leads anonimleştirilir:
fullName: existing.fullName.split(" ").map(w => w[0] + "***").join(" "),
// DİKKAT: 'reservations' local-store ve 'prisma.kvkkConsent' tablosu TEMİZLENMEZ!
```
- **Ne olur:** Yönetici "KVKK Anonimleştir" butonuna bastığında müşterinin adı ve telefonu `Reservation` tablosunda maskelenir; **ancak `prisma.kvkkConsent` tablosundaki ve `reservations` JSON dosyasındaki açık ad, e-posta ve IP kayıtları silinmez**. Kişisel veri sistemde yetim olarak kalır ve KVKK denetiminde suç teşkil eder. Ayrıca otomatik zamanlanmış görev yoktur.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Anonimleştirme fonksiyonu `prisma.kvkkConsent` ve `local-store` dosyalarını da kapsayacak şekilde genişletilmeli; 24 aydan eski kayıtları her ay otomatik anonimleştiren bir cron görevi kurulmalıdır.

---

#### FM-07: Meta Pixel & CAPI event_id Eşleşmesi ve Çerez İzni
- **Sonuç:** GEÇER
- **Kanıt:** `src/components/site/reservation-form.tsx:71-100` & `src/components/seo/meta-pixel.tsx:42-45`
```typescript
const eventId = `lead_${Date.now()}_...`;
// İstemci Pixel:
trackClientMetaLead({ eventId, ... });
// Sunucu CAPI:
submitReservation({ ..., eventId });
```
- **Ne olur:** İstemci tarafındaki Meta Pixel ile sunucu tarafındaki CAPI birebir aynı `eventId` değerini Meta'ya iletir; Meta mükerrer dönüşümleri eler (deduplication). Kullanıcı pazarlama çerezlerini reddetmişse Pixel yüklenmez ve istemci olayı bastırılır.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

### H) GÜVENLİK VE ALTYAPI

#### GV-01: Gizli Anahtarlar (Sabit Kodlanmış Fallback Secret)
- **Sonuç:** HATA
- **Kanıt:** `src/lib/meta/crypto.ts:11`
```typescript
function getEncryptionKey(): Buffer {
  const secret = process.env.META_ENCRYPTION_KEY || process.env.AUTH_SECRET || "elmira-davet-meta-aes-key-32bytes-secret";
  return crypto.createHash("sha256").update(secret).digest();
}
```
- **Ne olur:** Ortam değişkenleri tanımlanmadığında kod içinde açıkça yazılmış olan `"elmira-davet-meta-aes-key-32bytes-secret"` metni şifreleme anahtarı olarak kullanılır. Kod deposuna erişen herhangi biri veritabanındaki tüm Meta Page Access Token'larını bu sabit anahtarla kolayca çözebilir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Sabit kodlanmış fallback anahtar kaldırılmalı; ortam değişkeni eksikse sistem açık anahtara düşmek yerine doğrudan hata fırlatmalıdır (`throw new Error("Missing encryption key")`).

---

#### GV-02: SQL / ORM Sorgularında Kullanıcı Girdisi (SQL Injection)
- **Sonuç:** GEÇER
- **Kanıt:** `src/app/admin/actions.ts` & `src/lib/meta/lead-service.ts`
```typescript
// Tüm sorgular Prisma Client'ın parametrik nesneleriyle yapılır:
await prisma.reservation.findMany({ where: { status: ... } });
```
- **Ne olur:** Projede hiçbir yerde `$queryRawUnsafe` veya ham string birleştirme (`"SELECT * FROM users WHERE name = " + input`) kullanılmamıştır. SQL Injection açığı bulunmamaktadır.
- **Önem:** KRİTİK
- **Önerilen düzeltme:** Değişiklik gerekmez.

---

#### GV-03: API Uçlarında Bilgi Sızıntısı ve Rate Limit
- **Sonuç:** HATA
- **Kanıt:** `src/app/api/webhooks/meta/sync/route.ts:125-135` & `src/lib/auth.ts:87`
```typescript
// sync/route.ts içinde:
return NextResponse.json({ success: false, error: err.message }, { status: 500 });
// auth.ts içinde:
const isAllowed = checkRateLimit(`login_${email.toLowerCase().trim()}`, 5, 60 * 1000); // IP KONTROLÜ YOK!
```
- **Ne olur:** `/api/webhooks/meta/sync` rotasında hata oluştuğunda `err.message` doğrudan istemciye dönülür; veritabanı bağlantı şifresi veya sunucu iç dizinleri hata mesajında sızabilir. Ayrıca giriş panelinde IP bazlı rate limit olmadığı için tek bir IP'den yüzlerce farklı e-posta brute-force edilebilir.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** API hata yanıtları prodüksiyonda genel bir mesajla maskelenmeli (`"Bir sunucu hatası oluştu"`); giriş ekranına IP bazlı rate limit eklenmelidir.

---

#### GV-04: Ortam Değişkeni Doğrulaması (Fail-Fast Startup Validation)
- **Sonuç:** EKSİK
- **Kanıt:** `src/lib/prisma.ts` & `.env.example`
```typescript
// process.env.DATABASE_URL veya AUTH_SECRET eksik olduğunda açılışta kontrol EDİLMEZ:
const dbUrl = process.env.DATABASE_URL || "";
```
- **Ne olur:** Sunucu açıldığında eksik bir ortam değişkeni varsa (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`) uygulama açılışta hata vermek yerine başlar. İlk kullanıcı bir işlem yaptığında kriptik `P1001: Can't reach database` veya runtime crash ile sessizce çöker.
- **Önem:** ORTA
- **Önerilen düzeltme:** `src/env.ts` oluşturulmalı, Zod ile tüm zorunlu ortam değişkenleri sunucu başlarken doğrulanmalı ve eksikse açıklayıcı bir konsol hatasıyla derleme anında durdurulmalıdır.

---

#### GV-05: Çift Sunucu / Eşzamanlı Senkronizasyon Yarış Durumu (Race Condition)
- **Sonuç:** HATA
- **Kanıt:** `src/lib/meta/lead-service.ts:218-299`
```typescript
// sync endpoint'i iki farklı sunucuda aynı anda çalıştığında:
const existingLeads = await getAllMetaLeads(); // İkisi de aynı anda okur
// İkisi de Graph API'den çeker ve yazar:
await saveAllMetaLeads(existingLeads);
```
- **Ne olur:** İki sunucu örneği (veya cron ile yönetici butonu) aynı saniyede tetiklendiğinde dağıtık kilit (distributed lock / mutex) olmadığı için her iki sunucu da aynı lead'leri tekrar çeker ve `saveAllMetaLeads` birbirinin üstüne yazarken `prisma.reservation` içine mükerrer satırlar açar.
- **Önem:** YÜKSEK
- **Önerilen düzeltme:** Senkronizasyon işlemi veritabanı kilidi (`prisma.siteSetting` üzerinde advisory lock veya `isSyncing` durumu) altına alınmalı; devam eden bir işlem varken ikincisi reddedilmelidir.

---

## 3. EK BULGULAR (Senaryolarda Olmayan Kritik ve Mantıksal Hatalar)

Kod tabanı satır satır incelenirken senaryo listesinde yer almayan fakat projenin çalışmasını doğrudan engelleyen 6 önemli mantık hatası tespit edilmiştir:

1. **EK-01 (KRİTİK) — Admin Gösterge Paneli Tamamen Sahte (Mock) Veri Göstermektedir:**
   `src/app/admin/page.tsx:28-85` dosyasında istatistikler ve grafikler gerçek verilerden değil; statik formüllerle üretilmiş sahte verilerden oluşmaktadır. Ayrıca rezervasyonlar `take: 10` ile sınırlandırıldığı için panel 10'dan fazla talebi hiçbir zaman görememektedir.
2. **EK-02 (KRİTİK) — Rezervasyon İptalinde Tarihin Ön Yüzde Kilitli Kalması (Sessiz Hata):**
   `src/lib/crm/crm-service.ts:153-176` dosyasında bir rezervasyon iptal edildiğinde takvimden silinir fakat `prisma.blockedDate` tablosu silinmez. Bu yüzden müşteri veya salon sahibi o günü sonsuza dek rezerve edilemez olarak kilitli görür.
3. **EK-03 (KRİTİK) — `assertAuth()` Fonksiyonundaki Tehlikeli Dev Fallback:**
   `src/app/admin/actions.ts:16-25` dosyasında NextAuth oturumu bulunamadığında sistem hata fırlatmak yerine sahte ADMIN kullanıcısı dönmektedir. Bu durum tüm CRUD, kullanıcı ve rol yönetimi eylemlerini yetkisiz internet erişimine açık bırakmaktadır.
4. **EK-04 (YÜKSEK) — Ön Yüz Sayfalarının Admin İçeriklerini (Salon/Menü/Paket) Hiç Okumaması:**
   Ön yüz sayfaları (`/salonlar`, `/salonlar/[slug]`, `/etkinlikler`) doğrudan `mock-data.ts` dosyasından okuma yapmaktadır. Panelden yapılan salon düzenlemeleri ve yeni salon eklemeleri ön yüze asla yansımamaktadır.
5. **EK-05 (YÜKSEK) — Cloudinary Modülünün Ölü Kod (Dead Code) Olması:**
   `src/lib/cloudinary.ts` dosyası mevcuttur ancak ne galeri ne de içerik yönetiminde hiçbir yerden çağrılmamaktadır. Galeri yalnızca harici URL metinleri ile çalışmaktadır.
6. **EK-06 (ORTA) — Sıralama (Reorder) Simülasyonu:**
   `gallery-client.tsx:160` ve `content-manager.tsx:303` içindeki sıralama butonları sunucuya istek atmamakta, sadece arayüzde yer değiştirmekte ve sayfa yenilenince sıfırlanmaktadır.

---

## 4. ÖNEM SIRASINA GÖRE SIRALI ÖZET TABLO

| No | Senaryo / Bulgu Adı | Sonuç | Önem | İlgili Dosya(lar) |
|---|---|---|---|---|
| **YP-01** | Admin Action'larında Oturumsuz Erişim Açığı (Dev Fallback) | **HATA** | **KRİTİK** | `src/app/admin/actions.ts:16-25` |
| **YP-02** | EDITOR Rolünün Kullanıcı/Ayar Yönetimine Erişebilmesi | **HATA** | **KRİTİK** | `src/app/admin/actions.ts:1064-1160` |
| **YP-03** | Kullanıcının Kendi Rolünü ADMIN Seviyesine Yükseltebilmesi | **HATA** | **KRİTİK** | `src/app/admin/actions.ts:1120-1135` |
| **RZ-01** | Aynı Gün ve Slot İçin Eşzamanlı Çifte Rezervasyon | **HATA** | **KRİTİK** | `prisma/schema.prisma:170`, `src/lib/crm/crm-service.ts:133` |
| **RZ-09** | İptal Edilen Talebin Takvim Gününü Boşa Çıkarmaması | **HATA** | **KRİTİK** | `src/lib/crm/crm-service.ts:153-176` |
| **RP-01** | Gösterge Paneli İstatistiklerinin Sahte ve 10 Kayıtla Sınırlı Olması | **HATA** | **KRİTİK** | `src/app/admin/page.tsx:28-85` |
| **EK-01** | Dashboard Verilerinin Statik Formüllerle Üretilmesi | **HATA** | **KRİTİK** | `src/app/admin/page.tsx:28-85` |
| **EK-02** | İptal Edilen Günün BlockedDate Tablosunda Asılı Kalması | **HATA** | **KRİTİK** | `src/lib/crm/crm-service.ts:153-176` |
| **EK-03** | assertAuth() Nedeniyle Yetkisiz Kişilerin Veri Değiştirebilmesi | **HATA** | **KRİTİK** | `src/app/admin/actions.ts:16-25` |
| **RZ-02** | Günlük Satış ile Gündüz/Akşam Slot Modeli Tutarsızlığı | **HATA** | **YÜKSEK** | `prisma/schema.prisma:102`, `crm-service.ts:109` |
| **RZ-03** | Seansı Dolu Güne Ön Yüzden İkinci Talep Gönderilebilmesi | **HATA** | **YÜKSEK** | `src/app/(site)/actions.ts:47-66` |
| **RZ-07** | UTC vs Yerel Saat Dilimi Kayması Nedeniyle Günün Yanlış Kayması | **HATA** | **YÜKSEK** | `src/app/(site)/actions.ts:49-55` |
| **MT-04** | Aynı `leadgen_id` Eşzamanlı Geldiğinde Çift Kayıt Açılması | **HATA** | **YÜKSEK** | `src/lib/meta/lead-service.ts:218-224` |
| **CR-03** | Eşzamanlı Kayıtta Son Kaydeden Yöneticinin Diğerini Ezmesi | **HATA** | **YÜKSEK** | `src/app/admin/actions.ts:950-975` |
| **CR-05** | CSV Dışa Aktarmada Formül Enjeksiyonu (CSV Injection) Korumasızlığı | **HATA** | **YÜKSEK** | `src/app/admin/meta-leads/meta-leads-client.tsx:505` |
| **CR-06** | Silinen Taleplerin local-store Dosyasından Silinmeyip Sayılması | **HATA** | **YÜKSEK** | `src/app/admin/actions.ts:1000-1012` |
| **RP-05** | Kampanya Dağılım Toplamının Gerçek Verilerle Eşleşmemesi | **HATA** | **YÜKSEK** | `src/app/admin/page.tsx:68-80` |
| **YP-04** | Ön Yüzün Admin Salon/Paket/Menü Değişikliklerini Hiç Görmemesi | **HATA** | **YÜKSEK** | `src/app/(site)/salonlar/page.tsx:1-45` |
| **YP-05** | Admin İçerik Kayıtlarının Ön Yüze Revalidate Olamaması | **HATA** | **YÜKSEK** | `src/app/admin/actions.ts:290-292` |
| **YP-06** | Sıralama Değişikliklerinin Sunucuya Kaydedilmemesi (Simülasyon) | **HATA** | **YÜKSEK** | `src/app/admin/galeri/gallery-client.tsx:160` |
| **FM-06** | Anonimleştirilen Müşterinin KVKK Tablosunda Açık Metin Kalması | **HATA** | **YÜKSEK** | `src/app/admin/actions.ts:1020-1054` |
| **GV-01** | Kodda Sabit Kodlanmış AES Şifreleme Anahtarı Fallback'i | **HATA** | **YÜKSEK** | `src/lib/meta/crypto.ts:11` |
| **GV-03** | Sync API Uçlarında Bilgi Sızıntısı ve Eksik Rate Limiting | **HATA** | **YÜKSEK** | `src/app/api/webhooks/meta/sync/route.ts:125` |
| **GV-05** | İki Sunucu Örneğinde Senkronizasyonun Çift Kayıt Açması | **HATA** | **YÜKSEK** | `src/lib/meta/lead-service.ts:218-299` |
| **EK-04** | Ön Yüz Sayfalarının Tamamının mock-data.ts'ye Bağımlı Olması | **HATA** | **YÜKSEK** | `src/app/(site)/salonlar/page.tsx` |
| **EK-05** | Cloudinary Entegrasyonunun Hiçbir Yerden Çağrılmaması | **HATA** | **YÜKSEK** | `src/lib/cloudinary.ts` |
| **RZ-05** | 5000 Kişiye Kadar Girişe İzin Verilmesi (Salon Kapasitesi Aşımı) | **HATA** | **ORTA** | `src/lib/validations.ts:26-31` |
| **RZ-06** | Opsiyonlu Günlerin Otomatik Serbest Bırakılmaması (Eksik Cron) | **EKSİK** | **ORTA** | `src/lib/crm/crm-service.ts:20` |
| **RZ-08** | Salon Silindiğinde Bağlı Kayıtların Öksüz Kalması | **HATA** | **ORTA** | `src/app/admin/actions.ts:300-318` |
| **RZ-10** | Aynı Telefon Numarasından Arka Arkaya Talep Sınırlaması Olmaması | **HATA** | **ORTA** | `src/app/(site)/actions.ts:21-27` |
| **MT-05** | Siteden ve Reklamdan Gelen Aynı Kişinin Birleştirilememesi | **EKSİK** | **ORTA** | `src/lib/crm/crm-service.ts:245-285` |
| **MT-11** | Meta Test Lead'lerinin Dashboard Metriklerine Karışması | **HATA** | **ORTA** | `src/app/admin/meta-leads/meta-leads-client.tsx:455` |
| **CR-01** | Durum Geçişlerinde Mantıksal Kural Doğrulaması Olmaması | **EKSİK** | **ORTA** | `src/app/admin/actions.ts:950-975` |
| **CR-02** | Rezervasyon Durum Değişikliği Denetim İzi (Audit Log) Eksikliği | **HATA** | **ORTA** | `src/app/admin/actions.ts:950-975` |
| **RP-03** | Kapora İptalinde Dashboard Sayaçlarının Anlık Düşmemesi | **HATA** | **ORTA** | `src/app/admin/meta-leads/meta-leads-client.tsx:150` |
| **RP-04** | Gece 00:00-03:00 Arasında UTC-TSİ Günlük Rapor Kayması | **HATA** | **ORTA** | `src/app/admin/actions.ts:890-930` |
| **YP-07** | Dosya Türü/Boyutu Doğrulaması ve Cloudinary Temizliği Eksikliği | **EKSİK** | **ORTA** | `src/app/admin/galeri/gallery-client.tsx:84` |
| **YP-08** | İşlem Geçmişinin 80 Kayıt Sonra Kalıcı Olarak Silinmesi | **HATA** | **ORTA** | `src/app/admin/actions.ts:45-75` |
| **ON-01** | Büyük 'I' Harfi ve Türkçe Karakterli Bozuk URL (Slug) Üretimi | **HATA** | **ORTA** | `src/lib/utils.ts:16-29` |
| **ON-03** | Boş Görselde Next.js Image Bileşeninin Çökmesi ve Uzun Metinler | **HATA** | **ORTA** | `src/components/site/hall-card.tsx:32-37` |
| **ON-05** | Modal Açıldığında Lenis Yumuşak Kaydırmanın Arka Planı Kaydırması | **HATA** | **ORTA** | `src/components/providers/smooth-scroll-provider.tsx` |
| **FM-02** | KVKK Onayında Yasal Metin Sürümü / Politika Hash'i Tutulmaması | **HATA** | **ORTA** | `src/app/(site)/actions.ts:90-101` |
| **GV-04** | Başlangıçta Ortam Değişkeni Doğrulamasının Olmaması (Fail-Fast) | **EKSİK** | **ORTA** | `src/lib/prisma.ts` |
| **EK-06** | İçerik ve Galeri Sıralamasının Yalnızca UI Simülasyonu Olması | **HATA** | **ORTA** | `src/app/admin/icerik/content-manager.tsx:302` |
| **RP-06** | Meta Reklam Paneli ile DB Arasındaki Fark Açıklama Eksikliği | **EKSİK** | **DÜŞÜK** | `src/app/admin/meta-leads/page.tsx` |

---

## 5. SAYISAL DÖKÜM

```
┌────────────────────────┬─────────┐
│ Toplam İncelenen Madde │   66    │
├────────────────────────┼─────────┤
│ GEÇER                  │   31    │
│ HATA                   │   29    │
│ EKSİK                  │    6    │
│ DOĞRULANAMADI          │    0    │
└────────────────────────┴─────────┘
```

**Önem Derecesine Göre Hata & Eksik Dağılımı:**
- **KRİTİK:** 9 Madde (Güvenlik zafiyetleri, yetkisiz admin erişimi, çifte rezervasyon ve sessiz takvim kilitlenmesi)
- **YÜKSEK:** 16 Madde (Veri kaybı, CSV enjeksiyonu, mock veri bağımlılığı, yarış durumları)
- **ORTA:** 19 Madde (Kapasite kontrolleri, saat dilimi kaymaları, XSS dışı eksik validasyonlar)
- **DÜŞÜK:** 1 Madde (İstatistik detay mutabakatı)

---

## 6. ÖNERİLEN DÜZELTME SIRASI VE GEREKÇESİ

### 1. Aşama: Acil Güvenlik & Yetkilendirme Yaması (KRİTİK)
- **Neden Önce:** `assertAuth()` fonksiyonundaki geliştirici açığı nedeniyle şu anda internetteki herhangi bir kimse site yönetiminin tamamını ele geçirebilir, kullanıcıları silebilir veya rolünü ADMIN yapabilir.
- **Eylemler:**
  1. `src/app/admin/actions.ts` içindeki `assertAuth` fallback'i kaldırılacak; gerçek oturum yoksa `throw new Error("Unauthorized")` verilecek.
  2. `createUser`, `updateUserRole`, `deleteUser`, `saveSiteSettings` eylemlerine `user.role === "ADMIN"` kontrolü eklenecek.
  3. `src/lib/meta/crypto.ts` içindeki sabit kodlanmış `"elmira-davet-meta-aes-key-32bytes-secret"` kaldırılacak.

### 2. Aşama: Rezervasyon, Takvim & Slot Bütünlüğü (KRİTİK & YÜKSEK)
- **Neden İkinci:** Salonun ticari faaliyetinin kalbidir. İptal edilen bir düğünün tarihi takvimde kalıcı kilitli kaldığı için (RZ-09) yeni rezervasyon alınamamakta; eşzamanlı isteklerde ise aynı seansa iki düğün satılabilmektedir (RZ-01, RZ-02, RZ-03).
- **Eylemler:**
  1. `Reservation` tablosuna `timeSlot` ve `hall` eklenerek benzersiz kısıt tanımlanacak; transaction ile atomik yazılacak.
  2. `crm-service.ts` içinde rezervasyon iptal edildiğinde `prisma.blockedDate` kaydını da silen fonksiyon eklenecek.
  3. Zaman dilimi `Europe/Istanbul` olarak sabitlenerek UTC kayması engellenecek.

### 3. Aşama: Ön Yüzün Gerçek Veriye Bağlanması (YÜKSEK)
- **Neden Üçüncü:** Yönetim panelinde yapılan hiçbir salon, paket, etkinlik veya fiyat değişikliği şu anda ön yüze yansımamaktadır çünkü ön yüz sayfaları `mock-data.ts` dosyasını okumaktadır.
- **Eylemler:**
  1. `/salonlar`, `/salonlar/[slug]`, `/etkinlikler` sayfaları veritabanı ve `SiteSetting` kaynaklarına bağlanacak.
  2. Taslak durumundaki (`isActive: false`) kayıtlar filtrelenecek.
  3. Sıralama butonları (Reorder) gerçek veritabanı güncellemesine bağlanacak.

### 4. Aşama: Meta Entegrasyonu & Eşzamanlılık Koruması (YÜKSEK)
- **Neden Dördüncü:** Reklam bütçesi harcanırken eşzamanlı gelen webhook'ların mükerrer kayıt basması ve test lead'lerinin ciro istatistiklerini bozması engellenmelidir.
- **Eylemler:**
  1. `metaLeadgenId` için tekillik kısıtı getirilecek.
  2. Test lead'leri (`isTest: true`) istatistik hesaplamalarından ayrıştırılacak.
  3. Eşzamanlı çalışan senkronizasyon rotalarına kilit eklenecek.

### 5. Aşama: KVKK Bütünlüğü, CSV Enjeksiyonu ve Ön Yüz İnce Ayarları (ORTA)
- **Eylemler:**
  1. Anonimleştirme fonksiyonu `local-store` ve `prisma.kvkkConsent` tablolarını da temizleyecek şekilde tamamlanacak.
  2. CSV dışa aktarıma `=`, `+`, `-`, `@` formül enjeksiyonu koruması eklenecek.
  3. Modal pencerelere `data-lenis-prevent` eklenecek, Türkçe slug üretimi ve Next.js Image boş görsel koruması tamamlanacak.
