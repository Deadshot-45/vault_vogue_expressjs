import Products from "../models/Products.model.js";
import Users from "../models/User.model.js";

const getCart = async (req, res, next) => {
  try {
    const { user } = req.user;
    const isUser = await Users.findOne({
      $or: [{ email: user }, { mobile: user }],
    });
    if (!isUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    let cart = isUser.cart;
    console.log(user);
    res.status(200).json({
      error: false,
      message: "Cart fetched successfully",
      data: cart,
      fetchedBy: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartProduct = async (req, res, next) => {
  try {
    const { user } = req.user;
    const isUser = await Users.findOne({
      $or: [{ mobile: user }, { email: user }],
    });
    if (!isUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    const { _id, quantity, size } = req.body;
    const product = await Products.findById(_id);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found" });
    }
    const { name, price, description, category, subCategory, image } = product;

    const newProduct = {
      _id,
      name,
      description,
      image,
      price,
      quantity,
      size,
      category,
      subCategory,
    };
    const cart = isUser.cart;
    if (quantity === 0) {
      cart.splice(
        cart.findIndex((item) => item._id === _id),
        1
      );
      return res.status(200).json({
        error: false,
        message: "Item removed Successfully",
        data: isUser.cart,
      });
    }
    const index = cart.findIndex(
      (item) => item._id === _id && item.size === size
    );
    if (index === -1) {
      cart.push(newProduct);
    } else {
      cart[index].quantity = quantity; // Replace instead of add
    }
    await Users.updateOne({ _id: isUser._id }, { cart });
    res.status(200).json({
      error: false,
      message: "Cart updated Successfully",
      data: isUser.cart,
      fetchedBy: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCartProduct = async (req, res, next) => {
  try {
    const { user } = req.user;
    const isUser = await Users.findOne({
      $or: [{ mobile: user }, { email: user }],
    });
    if (!isUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
    const { _id } = req.params;
    const cart = isUser.cart;
    cart.splice(
      cart.findIndex((item) => item._id === _id),
      1
    );
    await Users.updateOne({ _id: isUser._id }, { cart });
    res.status(200).json({
      error: false,
      message: "Product deleted Successfully",
      data: isUser.cart,
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { user } = req.user;
    const isUser = await Users.findOne({
      $or: [{ mobile: user }, { email: user }],
    });

    if (!isUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const product = req.body;

    // Ensure all required fields are present
    const newProduct = {
      _id: product._id || "",
      name: product.name || "",
      price: product.price || 0,
      image: Array.isArray(product.image) ? product.image : [],
      description: product.description || "",
      size: (product.size && product.size.trim()) || "",
      stock: product.stock || 0,
      quantity: 1,
      favorate: false,
      category: product.category || "",
      subCategory: product.subCategory || "",
    };

    // Basic validation
    if (!newProduct._id || !newProduct.size) {
      return res.status(400).json({
        error: true,
        message: "Invalid product data: ID and size are required",
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = isUser.cart.findIndex(
      (item) => item._id === newProduct._id && item.size === newProduct.size
    );

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      isUser.cart[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart
      isUser.cart.push(newProduct);
    }

    // Save with validation disabled for this operation
    await isUser.save({ validateBeforeSave: false });

    return res.status(200).json({
      error: false,
      message:
        existingItemIndex !== -1
          ? "Product quantity increased"
          : "Product added to cart",
      data: isUser.cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error.message);
    next(error);
  }
};

const getFavorate = async (req, res, next) => {
  const { user } = req.user;

  try {
    const existingUser = await Users.findOne({
      $or: [{ email: user }, { mobile: user }],
    });

    if (!existingUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    const userId = existingUser._id;
    const userFavorites = existingUser.favorite || [];
    const requestFavorites = req.body;

    if (!Array.isArray(requestFavorites)) {
      return res
        .status(400)
        .json({ error: "Invalid request body: favorites must be an array" });
    }

    // Create a copy of requestFavorites to avoid modifying the original
    const newRequestItems = [...requestFavorites];

    // Filter out duplicates from the request (items already in userFavorites)
    userFavorites.forEach((item) => {
      const duplicateIndex = newRequestItems.findIndex(
        (ele) => ele._id === item._id
      );
      if (duplicateIndex !== -1) {
        newRequestItems.splice(duplicateIndex, 1);
      }
    });

    // Combine existing favorites with new ones
    const newFavorites = [...userFavorites, ...newRequestItems];

    // Update user document
    await Users.updateOne({ _id: userId }, { favorite: newFavorites });

    res.status(200).json({
      error: false,
      message: "Favorites updated successfully",
      data: newFavorites,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateFavorate = async (req, res, next) => {
  const { user } = req.user;
  try {
    const existingUser = await Users.findOne({
      $or: [{ email: user }, { mobile: user }],
    });

    if (!existingUser) {
      return res.status(404).json({ error: true, message: "User   not found" });
    }

    const favoriteItem = req.body;

    if (!favoriteItem || !favoriteItem._id) {
      return res.status(400).json({
        error: true,
        message: "Invalid request: favorite item must have an _id",
      });
    }

    const isFav = existingUser.favorite.find(
      (item) => item._id === favoriteItem._id
    );

    if (isFav) {
      // Toggle favorite status
      isFav.favorate = !isFav.favorate;
    } else {
      const newFavorites = [
        ...existingUser.favorite,
        { ...favoriteItem, favorate: true },
      ];
      existingUser.favorite = newFavorites;
    }
    existingUser.favorite = existingUser.favorite.filter(
      (item) => item.favorate
    );
    console.log("object", existingUser);
    existingUser.save();

    return res.json({
      error: false,
      message: "Favorites updated successfully",
      data: existingUser.favorite,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
export {
  getCart,
  updateCartProduct,
  deleteCartProduct,
  addToCart,
  getFavorate,
  updateFavorate,
};
