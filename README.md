# Instacampus - Online Canteen & Stationary Ordering System

## 📌 What We Do
Instacampus is a digital platform designed to simplify food and stationary ordering for students and staff inside campuses.  
It provides:
- Online ordering of **canteen food & drinks**
- Easy access to **stationary & Xerox services**
- **Vendor-specific portals** for managing inventory and products
- **User authentication & role-based access**

---

## 💡 Why We Do
Traditional campus ordering systems are inefficient:
- Students wait in long queues
- Vendors face mismanagement of stock
- Limited visibility of demand leads to wastage or stock-outs  

👉 Instacampus solves these problems by:
- Allowing **pre-ordering** of food and stationary
- Enabling vendors to **track sales and manage inventory**
- Providing **students a faster and convenient experience**

---

## ⚙️ How We Do
We built Instacampus using the **MERN stack** with a focus on modular API design.

- **Authentication:** Secure signup, login, logout with JWT and bcrypt  
- **Role-based Access:**  
  - Students (place orders)  
  - Vendors (canteen & stationary management)  
  - Admins (system oversight)  
- **Routers:**  
  - **Auth Router:** Handles signup, login, logout  
  - **Cart Router:** Manage user carts (canteen / stationary separately)  
  - **User Router:** Manage user profile  
  - **Product Router:** Add, update, delete, view products  

---

## 🚀 API Routers Documentation

### 1️⃣ Auth Router (`/auth`)
Handles **user authentication**.

- **POST `/signup`** → Register a new user  
- **POST `/login`** → Login with email & password  
  - Returns a JWT token (stored in cookie)  
- **POST `/logout`** → Clears auth token  

**Key Features:**
- Passwords hashed with **bcrypt**
- JWT-based **stateless authentication**
- Role-based (student, canteen-vendor, stationary-vendor, admin)

---

### 2️⃣ Cart Router (`/cart`)
Handles **cart operations per category** (canteen / stationary).

- **POST `/add/:category`** → Add item to cart  
- **GET `/:category`** → View cart by category  
- **POST `/clear/:category`** → Clear specific cart  

**Key Features:**
- Each user has **separate carts per category**  
- Checks **inventory stock availability** before adding  
- Prevents ordering beyond available stock  

---

### 3️⃣ User Router (`/user`)
Manages **user profile**.

- **GET `/`** → Get logged-in user profile (excluding password)  
- **PATCH `/`** → Update name/password (re-authentication required)  

**Key Features:**
- Password re-hash handled in `User` model  
- Clears token after profile update for security  

---

### 4️⃣ Product Router (`/product`)
Handles **product management** by vendors.

- **POST `/`** (Vendor Only) → Add product  
- **GET `/`** (User) → Get all products  
- **GET `/:id`** → Get product by ID  
- **PATCH `/:id`** (Vendor Only) → Update product  
- **DELETE `/:id`** (Vendor Only) → Delete product  
- **GET `/category/:category`** (User) → Get products by category  

**Key Features:**
- Vendor role restrictions:  
  - **Canteen vendors** → Only *Food and Drinks*  
  - **Stationary vendors** → Only *Stationary & Xeros*  
- Products linked with **low stock threshold alerts**

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ODM)  
- **Authentication:** JWT + bcrypt + cookies  
- **Frontend (planned):** React.js / Next.js  

---

## 📌 Future Enhancements
- Order tracking & notifications  
- Payment gateway integration  
- Analytics dashboard for vendors  
- Mobile app version  

---

## ✅ Summary
Instacampus streamlines campus life by **digitizing food & stationary ordering**, ensuring **convenience for students** and **efficiency for vendors**.  
Our modular **router-based API design** ensures scalability and maintainability.
