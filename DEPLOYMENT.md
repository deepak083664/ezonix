# Deployment Guide

Follow these steps to deploy the Business Management CRM Web Application in production.

---

## 1. Database Setup (MongoDB Atlas)

1. Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. In **Database Access**, create a user with a secure password (make note of it).
4. In **Network Access**, add `0.0.0.0/8` (Allow access from anywhere) so that Render servers can connect to it.
5. In **Database**, click **Connect** -> **Drivers** (Node.js). Copy the connection URI string.
6. Replace `<password>` with the user's password you created in step 3. The final string is your `MONGO_URI`.

---

## 2. Backend Deployment (Render)

1. Log in to [Render](https://render.com).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Name**: `crm-backend`
   - **Language**: `Node`
   - **Build Command**: `npm install` (or `npm install --legacy-peer-deps` depending on peer dependencies)
   - **Start Command**: `npm start`
5. In the **Environment** tab, click **Add Environment Variable** and enter the following values:
   - `PORT`: `10000` (Render binds ports dynamically, this is default)
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `your_mongodb_atlas_uri`
   - `JWT_SECRET`: `your_long_random_jwt_secret`
   - `JWT_EXPIRES_IN`: `30d`
   - `GOOGLE_CLIENT_ID`: `your_google_oauth_client_id` (optional, for Google Login)
   - `CLOUDINARY_CLOUD_NAME`: `your_cloudinary_cloud_name` (optional, for cloud images)
   - `CLOUDINARY_API_KEY`: `your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET`: `your_cloudinary_api_secret`
6. Click **Deploy Web Service**. Render will build and start your Express API server. Take note of the live URL (e.g. `https://crm-backend.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select and import your GitHub repository.
4. Set the following configurations:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In the **Environment Variables** section, add:
   - `VITE_API_URL`: Set this to your live Render backend API URL with `/api/v1` appended (e.g., `https://crm-backend.onrender.com/api/v1`).
6. Click **Deploy**. Vercel will bundle the Vite production build and deploy your application.

---

## Local Development Checklist

Ensure you have Node.js and MongoDB installed locally.
1. Run local MongoDB instance: `mongod`.
2. Start the Backend API server:
   ```bash
   cd backend
   npm run dev
   ```
3. Start the Frontend Vite dev server:
   ```bash
   cd frontend
   npm run dev
   ```
4. Access the CRM application dashboard on your local browser: `http://localhost:5173`.
