# Product Recommendation System

## Problem Statement

Build a recommendation feature for an e-commerce website.  
When a user views a product, the system should recommend other relevant products they are most likely to buy.

### Requirements

- Input dataset of products with attributes (category, price, brand, tags).
- Input dataset of user purchase history (user → purchased products).
- For a given product, return **Top 5 recommendations**.
- Recommendation logic should use:
  - Products from the same category/brand
  - Items frequently bought together
  - Similar price range
  - Tag similarity
  - Personalization using user history

---

## Approach (How Recommendations Are Calculated)

We combine different signals into a **score**:

1. **Category Match** → +3 points  
   (same category is the strongest indicator)
2. **Brand Match** → +1 point
3. **Frequently Bought Together** → +0.5 × co-purchase count
4. **Price Similarity** → +0.5 × normalized score (0 to 1)
   - Normalization ensures that “₹100 difference” is big for cheap items but small for expensive items
5. **Tag Overlap (Jaccard Similarity)** → +1.5 × score (0 to 1)
   - Jaccard = `common tags ÷ all unique tags`
   - Example: `["running","men"]` vs `["running","unisex"]` → 1 ÷ 3 = 0.33

If a **userId** is provided, we add a **user boost**:

- Higher score if the candidate matches the user’s past preferences (category, brand, tags).
- Small bonus for **novelty** (items they don’t already own).

👉 Final score = **base score + user boost**

---

## Dataset Format

### `products.json`

````json
[
  {
    "id": "p1",
    "title": "Nike Air Zoom Pegasus",
    "category": "shoes",
    "brand": "Nike",
    "price": 5999,
    "tags": ["running", "men", "lightweight"]
  },
  ...
]
````




### `purchases.json`
````json
[
  { "userId": "u1", "products": ["p1","p4","p7"] },
  { "userId": "u2", "products": ["p2","p3"] }
]

````

## 📁 Project Structure

data/
├── products.json
└── purchases.json

public/
└── index.html # Simple frontend to test recommendations

src/
├── controller/
│ └── Recommendation/
│ └── RecommendationController.mjs
├── helper/
│ ├── dataStoreHelper.mjs # Loads products & purchases, builds co-purchase + user profiles
│ └── recommendationHelper.mjs # Core recommendation logic
├── routes/
│ ├── RecommendationRoutes/
│ │ └── recommendationRoutes.mjs
│ └── routes.mjs
├── server/
│ └── server.mjs # Express server exposing APIs
└── index.mjs

.env
.gitignore
package-lock.json
package.json
README.md

#.env
PORT = 3000


## How to run

# Clone the repo
git clone https://github.com/kaushikshivam970/product-recommendations.git
cd product-recommendation

# Install dependencies
npm install

# Run server
npm start


# Open frontend in browser

http://localhost:3000/

### API Endpoints

GET /api/v1/app/recommendations/products → list of products

GET /api/v1/app/recommendations/users → list of users

GET /api/v1/app/recommendations/get-recommendation?productId=p1&userId=u1
→ returns top 5 recommendations

#Sample Output

{
  "statusText": "OK",
  "status": 200,
  "message": "Recommendations generated successfully",
  "data": {
    "productId": "p1",
    "recommendations": [
      {
        "id": "p3",
        "title": "Puma Velocity Nitro",
        "category": "shoes",
        "brand": "Puma",
        "price": 5699,
        "tags": ["running","men","cushion"],
        "_score": 5.53,
        "_base": 4.19,
        "_userBoost": 1.34
      }
    ]
  }
}



````
