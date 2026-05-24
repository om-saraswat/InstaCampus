# Instacampus - Online Canteen & Stationary Ordering System

## 📌 What We Do
Instacampus is a platform that digitizes campus ordering, making it simple for students and vendors to interact.  
Students can:
- Order **canteen food & drinks**
- Buy **stationary or request Xerox/printing services**

Vendors can:
- Manage **inventory, products, and orders**
- Track **sales, restocking, and order statuses**

---

## 💡 Why We Do
- **For Students:** Avoid queues, save time, and access campus services from anywhere.  
- **For Vendors:** Automate order management, reduce manual errors, and get real-time stock insights.  
- **For Campus:** Build a sustainable, tech-driven ecosystem.  

---

## ⚙️ How We Do
- **Backend:** Node.js, Express.js, MongoDB (Mongoose ODM)  
- **Authentication:** JWT + bcrypt (role-based access: student, canteen-vendor, stationary-vendor, admin)  
- **Routers:** Modular design for scalability  
- **Frontend:** Built with React (or Next.js) for real-time ordering & vendor dashboards  

---

## 🚀 API Routers Documentation

### 1️⃣ Auth Router (`/auth`)
Handles **user authentication**.

- `POST /signup` → Register user  
- `POST /login` → Login user (JWT in cookie)  
- `POST /logout` → Logout user  

---

### 2️⃣ Cart Router (`/cart`)
Manage user carts.

- `POST /add/:category` → Add product to cart  
- `GET /:category` → Get cart items  
- `POST /clear/:category` → Empty cart  

---

### 3️⃣ User Router (`/user`)
Manage profiles.

- `GET /` → Get profile (excludes password)  
- `PATCH /` → Update profile (name/password)  

---

### 4️⃣ Product Router (`/product`)
Vendor product management.

- `POST /` (Vendor) → Add product  
- `GET /` (User) → Get all products  
- `GET /:id` (User) → Get product by ID  
- `PATCH /:id` (Vendor) → Update product  
- `DELETE /:id` (Vendor) → Delete product  
- `GET /category/:category` (User) → Products by category  

⚠️ **Vendor Restrictions:**  
- Canteen vendors → Only *Food and Drinks*  
- Stationary vendors → Only *Stationary* & *Xeros*  

---

### 5️⃣ Vendor Order Router (`/vendor/orders`)
Vendors manage and view customer orders.

- `GET /orders` → Get all vendor orders (filtered by category)  
- `GET /recent/orders` → Get recent pending/confirmed/preparing/ready orders  
- `PATCH /order/:status/:id` → Update order status (pending → confirmed → preparing → ready → completed / cancelled)  

---

### 6️⃣ Printing Orders Router (`/print`)
Special route for Xerox/printing services.

- `POST /print-order` → Create a printing order + linked order  
- `GET /print-order/:id` → Fetch a specific printing order  

💡 **Features:**
- Calculates price based on pages, copies, color, etc.  
- Creates a normal `Order` entry alongside `PrintingOrder`.  

---

### 7️⃣ Orders Router (`/orders`)
Manages user orders (canteen/stationary).

- `POST /from-cart/:category` → Convert cart → Order  
- `GET /` → Get all orders for logged-in user  
- `GET /:id` → Get a specific order  
- `PATCH /cancel/:id` → Cancel an order & restore inventory  

---

### 8️⃣ Inventory Router (`/inventory`)
Vendors manage product stock.

- `GET /` → View vendor inventory  
- `PATCH /:id/restock` → Increase stock  
- `PATCH /:id/deduct` → Deduct stock  

---

## 🎨 Frontend Overview
The **frontend** is built to provide a seamless experience for both students and vendors.

### Student Portal
- **Browse products** by category (canteen, stationary, Xerox)  
- **Add to cart & place orders**  
- **Track order status** (pending → confirmed → ready → completed)  
- **View history & invoices**  

### Vendor Dashboard
- **Add & manage products**  
- **View orders in real-time**  
- **Update order statuses** (for preparation & delivery)  
- **Manage inventory stock (restock/deduct)**  

### Tech Choices
- **Framework:** React.js / Next.js  
- **Styling:** Tailwind CSS + shadcn/ui  
- **State Management:** Redux Toolkit or React Query  
- **API Calls:** Axios / Fetch to backend  

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT, bcrypt  
- **Frontend:** React / Next.js, Tailwind CSS  
- **Deployment:** (planned) Docker + Cloud Hosting  

---

## 📌 Future Enhancements
- Payment gateway integration (UPI/PayPal/Stripe)  
- Vendor analytics dashboard  
- Push notifications (order ready, out-of-stock alerts)  
- Mobile app (React Native / Flutter)  

---

##  Summary
Instacampus connects **students, vendors, and campus services** into a single digital ecosystem.  
From **canteen ordering** to **stationary & printing requests**, everything is unified for speed, efficiency, and convenience.  


