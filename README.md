# Vault Vogue Express.js API

Backend API for the Vault Vogue e-commerce platform, built with Express.js and MongoDB.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## 🛣️ API Routes

### Products

- `GET /api/data/products/getproducts` - Get all products
- `GET /api/data/products/getproduct/:id` - Get product by ID
- `GET /api/data/products/productquery/:query` - Search products
- `GET /api/data/products/searchproduct/:query` - Advanced product search
- `POST /api/data/products/addproducts` - Add new products

### User Authentication

- `POST /api/data/login` - User login
- `POST /api/data/signup` - User registration
- `POST /api/data/verifyotp` - Verify OTP
- `POST /api/data/resendotp` - Resend OTP
- `POST /api/data/user/logout` - User logout

### User Management

- `GET /api/data/getuser` - Get user profile
- `PUT /api/data/updateuser` - Update user profile
- `POST /api/data/updateimg` - Update user image

### Cart Operations

- `GET /api/data/cart/getcart` - Get user's cart
- `PUT /api/data/cart/addtocart` - Add item to cart
- `POST /api/data/cart/updatecart` - Update cart item
- `DELETE /api/data/cart/deletecartproduct/:_id` - Remove item from cart

### Favorites

- `POST /api/data/cart/favorates` - Get user's favorites
- `PUT /api/data/cart/updatefavorate` - Update favorites

## 🔒 Security Features

- Rate limiting: 100 requests per 15 minutes in production
- CORS: Configured for specific origins:
  - `http://localhost:5173` (development)
  - `https://vogue-vault-blue.vercel.app` (production)
- Helmet.js for security headers
- JWT authentication
- Request validation
- Database connection error handling

## 🛠️ Tech Stack

- Express.js
- MongoDB with Mongoose
- Winston for logging
- JWT for authentication
- Multer for file uploads
- Helmet for security
- CORS for cross-origin requests
- Rate limiting

## 🚀 Deployment

The API is deployed on Vercel. The production endpoint is:

```
https://vault-vogue-expressjs.vercel.app
```

### Vercel Configuration

- Node.js version: 18.x
- Build command: `npm run build`
- Output directory: `public`
- Install command: `npm install`

## 📝 Development Notes

1. Environment setup:

   - Ensure Node.js 18.x is installed
   - Set up MongoDB instance
   - Configure environment variables

2. Local development:

   ```bash
   npm run dev
   ```

3. Testing:

   ```bash
   npm test
   ```

4. Production build:
   ```bash
   npm run build
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC License
