import Products from "../Models/Products.model.js";

const getProducts = async (req, res, next) => {
  try {
    const products = await Products.find();
    res.status(200).json({ error: false, products });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found" });
    }
    return res
      .status(200)
      .json({ error: false, message: "Product found", product });
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  try {
    const product = new Products(req.body);
    // Iterate over property values
    for (const value of Object.values(product)) {
      if (value === null || value === undefined || value.length === 0) {
        // Property value is null or undefined
        res.status(400).send("Invalid product data");
        return;
      }
    }
    // let image = [];
    // if (req.files.image) {
    //   let url = "http://localhost:5500/";
    //   req.files.image.forEach((file) => {
    //     image.push(url + file.filename); // Add the file to the array
    //   });
    // }
    // product.image = image;
    // Save product to database
    await product.save();
    res
      .status(201)
      .json({ error: false, message: "Product added successfully" });
  } catch (error) {
    next(error);
  }
};

const searchProduct = async (req, res, next) => {
  try {
    // const { query } = req.query;
    const { query } = req.params;
    console.log(query, "hii");
    if (!query) {
      // Check if query parameter is provided
      return res
        .status(400)
        .json({ error: true, message: "Query parameter is required" });
    }
    const products = await Products.find({
      // Search for products
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { subCategory: { $regex: query, $options: "i" } },
      ],
    });
    if (products.length === 0) {
      // Check if products are found
      return res
        .status(404)
        .json({ error: true, message: "Product not found" });
    }
    res.status(200).json({
      error: false,
      message: "Data Fetched Successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const productQuery = async (req, res, next) => {
  try {
    // const { query } = req.query;
    const { query } = req.params;
    console.log(query, "hii");
    if (!query) {
      // Check if query parameter is provided
      return res
        .status(400)
        .json({ error: true, message: "Query parameter is required" });
    }
    const products = await Products.find({
      // Search for products
      $or: [
        { category: query },
        { subCategory: { $regex: query, $options: "i" } },
      ],
    });
    if (products.length === 0) {
      // Check if products are found
      return res
        .status(404)
        .json({ error: true, message: "Product not found" });
    }
    res.status(200).json({
      error: false,
      message: "Data Fetched Successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const addProducts = async (req, res, next) => {
  try {
    const products = req.body; // Expecting an array of products
    if (!Array.isArray(products)) {
      console.log("Invalid request data:", products);
      res.status(400).send("Invalid request data");
      return;
    }

    // Validate each product in the array
    for (const product of products) {
      console.log("Product Data:", product);
      for (const [key, value] of Object.entries(product)) {
        if (value === null || value === undefined || value.length === 0) {
          console.log(`Invalid product data: ${key} is missing or empty`);
          res.status(400).send("Invalid product data");
          return;
        }
      }
    }

    // Create and save each product in the array
    const savedProducts = await Promise.all(
      products.map((product) => {
        const newProduct = new Products(product);
        return newProduct.save();
      })
    );

    res.status(201).json({
      error: false,
      message: "Products added successfully",
      data: savedProducts,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  getProduct,
  addProducts,
  addProduct,
  searchProduct,
  productQuery,
};
