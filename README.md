# Swapify

Swapify, kullanıcıların ürünlerini listeleyip takas edebildiği, kategori bazlı filtreleme ve kullanıcı profili entegrasyonuna sahip React Native & Django tabanlı bir mobil uygulamadır.

---

## Teknolojiler

Frontend:  
- React Native (Expo)  
- React Navigation  
- Axios  
- AsyncStorage  

Backend:  
- Django  
- Django REST Framework  
- JWT Authentication  

---

## Kurulum

Backend:

1. Sanal ortam oluşturun ve aktif edin:  
   python -m venv env  
   source env/bin/activate  # Windows için: env\Scripts\activate

2. Gerekli paketleri yükleyin:  
   pip install -r requirements.txt

3. Veritabanı migrasyonlarını uygulayın:  
   python manage.py migrate

4. Sunucuyu başlatın:  
   python manage.py runserver

Frontend:

1. Proje dizinine gidin:  
   cd frontend_swapify

2. Gerekli paketleri yükleyin:  
   npm install  
   veya  
   yarn install

3. Uygulamayı başlatın:  
   expo start

---

## Özellikler

- Kullanıcı kaydı, giriş, çıkış ve JWT tabanlı yetkilendirme  
- Ürün ekleme, düzenleme, silme ve listeleme  
- Kategori bazlı ürün filtreleme ve arama  
- Profil fotoğrafı yükleme ve profil bilgilerini güncelleme  
- Ürün detay görüntüleme ve kullanıcı profiline yönlendirme  

---

## İletişim

Proje hakkında sorularınız için:  
Özenç Dönmezer  
ozzencben@gmail.com

---

## Katkıda Bulunma

Katkılar için lütfen fork yapın ve pull request gönderin.  
Her türlü geri bildiriminiz için teşekkür ederiz!
