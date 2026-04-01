// frontend/src/pages/CustomCakeBuilder.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/Slice";

const CustomCakeBuilder = () => {
  const dispatch = useDispatch();

  // ==== DATA STATE ====
  const [baseCakes, setBaseCakes] = useState([]);
  const [shapeOptions, setShapeOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [flavorOptions, setFlavorOptions] = useState([]);
  const [frostingOptions, setFrostingOptions] = useState([]);
  const [toppingOptions, setToppingOptions] = useState([]);

  // ==== SELECTION STATE ====
  const [selectedBaseCake, setSelectedBaseCake] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedFrosting, setSelectedFrosting] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#d78f52");
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [customMessage, setCustomMessage] = useState("");

  // ==== STATIC PRICES ====
  const staticPrices = {
    shapes: {
      Round: 0,
      Square: 50,
      Heart: 100,
      Rectangle: 75,
    },
    sizes: {
      "0.5kg": 0,
      "1kg": 100,
      "1.5kg": 150,
      "2kg": 200,
      "3kg": 300,
    },
    flavors: {
      Vanilla: 0,
      Chocolate: 50,
      "Red Velvet": 100,
      Butterscotch: 80,
      Strawberry: 70,
    },
    frostings: {
      Buttercream: 0,
      Fondant: 150,
      "Whipped Cream": 50,
      "Cream Cheese": 100,
    },
    toppings: {
      Fruits: 30,
      Nuts: 40,
      Chocolates: 50,
      Sprinkles: 20,
      "Edible Flowers": 80,
      "Caramel Drizzle": 40,
    },
  };

  // ==== PRICE ====
  const [prices, setPrices] = useState({ basePrice: 0, totalPrice: 0 });
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // ==== STATUS / UI ====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==== STATIC DATA ====
  const staticBaseCakes = [
    {
      id: "classic-round",
      name: "Classic Round Cake",
      basePrice: 599,
      image: "/images/cakes/round-cake.jpg",
      description: "Classic round shaped cake perfect for any occasion",
    },
    {
      id: "square-cake",
      name: "Square Cake",
      basePrice: 699,
      image: "/images/cakes/square-cake.jpg",
      description: "Modern square shaped cake",
    },
    {
      id: "heart-shaped",
      name: "Heart Shaped Cake",
      basePrice: 799,
      image: "/images/cakes/heart-shaped.jpg",
      description: "Romantic heart shaped cake",
    },
    {
      id: "tiered-cake",
      name: "Tiered Cake",
      basePrice: 1499,
      image: "/images/cakes/tiered-cake.jpg",
      description: "Elegant tiered wedding cake",
    },
  ];

  const staticShapes = [
    { _id: "round", name: "Round", price: 0 },
    { _id: "square", name: "Square", price: 50 },
    { _id: "heart", name: "Heart", price: 100 },
    { _id: "rectangle", name: "Rectangle", price: 75 },
  ];

  const staticSizes = [
    { _id: "0.5kg", name: "0.5kg", price: 0 },
    { _id: "1kg", name: "1kg", price: 100 },
    { _id: "1.5kg", name: "1.5kg", price: 150 },
    { _id: "2kg", name: "2kg", price: 200 },
    { _id: "3kg", name: "3kg", price: 300 },
  ];

  const staticFlavors = [
    { _id: "vanilla", name: "Vanilla", price: 0 },
    { _id: "chocolate", name: "Chocolate", price: 50 },
    { _id: "red-velvet", name: "Red Velvet", price: 100 },
    { _id: "butterscotch", name: "Butterscotch", price: 80 },
    { _id: "strawberry", name: "Strawberry", price: 70 },
  ];

  const staticFrostings = [
    { _id: "buttercream", name: "Buttercream", price: 0 },
    { _id: "fondant", name: "Fondant", price: 150 },
    { _id: "whipped-cream", name: "Whipped Cream", price: 50 },
    { _id: "cream-cheese", name: "Cream Cheese", price: 100 },
  ];

  const staticToppings = [
    { _id: "fruits", name: "Fruits", price: 30 },
    { _id: "nuts", name: "Nuts", price: 40 },
    { _id: "chocolates", name: "Chocolates", price: 50 },
    { _id: "sprinkles", name: "Sprinkles", price: 20 },
    { _id: "edible-flowers", name: "Edible Flowers", price: 80 },
    { _id: "caramel", name: "Caramel Drizzle", price: 40 },
  ];

  // Helper to choose shape class (keeps theme same)
  const getShapeClass = (shapeName) => {
    if (!shapeName) return "rounded-full";
    const s = shapeName.toLowerCase();
    if (s.includes("round")) return "rounded-full";
    if (s.includes("square")) return "rounded-xl";
    if (s.includes("rectangle") || s.includes("tier")) return "rounded-lg";
    if (s.includes("heart")) return "clip-heart";
    return "rounded-full";
  };

  // -------- Fetch helpers ----------
  const fetchCategory = async (category, setter, staticData) => {
    try {
      const res = await axios.get(
        `/api/customizations/${category.toLowerCase()}`
      );
      if (res.data?.success && res.data.data.length > 0) {
        // Add price to options if not present
        const dataWithPrices = res.data.data.map((item) => ({
          ...item,
          price:
            item.options?.[0]?.price ||
            staticPrices[category]?.[item.name] ||
            0,
        }));
        setter(dataWithPrices);
      } else {
        // Use static data if API returns empty
        setter(staticData);
      }
    } catch (err) {
      console.error(`Failed to load ${category}, using static data`, err);
      setter(staticData);
    }
  };

  // -------- Initial load -----------
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        // Try to fetch base cakes from API
        try {
          const baseRes = await axios.get(
            "/api/customizations/base-cakes"
          );
          if (baseRes.data?.success && baseRes.data.data.length > 0) {
            setBaseCakes(baseRes.data.data);
            setSelectedBaseCake(baseRes.data.data[0]);
            setPrices({
              basePrice: baseRes.data.data[0].basePrice || 599,
              totalPrice: baseRes.data.data[0].basePrice || 599,
            });
          } else {
            throw new Error("No data from API");
          }
        } catch (err) {
          console.log("Using static base cakes");
          setBaseCakes(staticBaseCakes);
          setSelectedBaseCake(staticBaseCakes[0]);
          setPrices({
            basePrice: staticBaseCakes[0].basePrice,
            totalPrice: staticBaseCakes[0].basePrice,
          });
        }

        // Fetch other categories
        await Promise.all([
          fetchCategory("shape", setShapeOptions, staticShapes),
          fetchCategory("size", setSizeOptions, staticSizes),
          fetchCategory("flavor", setFlavorOptions, staticFlavors),
          fetchCategory("icing", setFrostingOptions, staticFrostings),
          fetchCategory("toppings", setToppingOptions, staticToppings),
        ]);
      } catch (err) {
        console.error(err);
        setError(
          "Failed to load customization options. Using default options."
        );

        // Set all static data as fallback
        setBaseCakes(staticBaseCakes);
        setShapeOptions(staticShapes);
        setSizeOptions(staticSizes);
        setFlavorOptions(staticFlavors);
        setFrostingOptions(staticFrostings);
        setToppingOptions(staticToppings);

        if (staticBaseCakes.length > 0) {
          setSelectedBaseCake(staticBaseCakes[0]);
          setPrices({
            basePrice: staticBaseCakes[0].basePrice,
            totalPrice: staticBaseCakes[0].basePrice,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------- Price Calculation ----------
  useEffect(() => {
    const calculatePrice = () => {
      if (!selectedBaseCake) return;

      setCalculatingPrice(true);

      try {
        let total = selectedBaseCake.basePrice || 599;

        // Add shape price
        if (selectedShape) {
          const shapePrice =
            selectedShape.price || staticPrices.shapes[selectedShape.name] || 0;
          total += shapePrice;
        }

        // Add size price
        if (selectedSize) {
          const sizePrice =
            selectedSize.price || staticPrices.sizes[selectedSize.name] || 0;
          total += sizePrice;
        }

        // Add flavor price
        if (selectedFlavor) {
          const flavorPrice =
            selectedFlavor.price ||
            staticPrices.flavors[selectedFlavor.name] ||
            0;
          total += flavorPrice;
        }

        // Add frosting price
        if (selectedFrosting) {
          const frostingPrice =
            selectedFrosting.price ||
            staticPrices.frostings[selectedFrosting.name] ||
            0;
          total += frostingPrice;
        }

        // Add toppings price
        selectedToppings.forEach((topping) => {
          const toppingPrice =
            topping.price || staticPrices.toppings[topping.name] || 0;
          total += toppingPrice;
        });

        setPrices({
          basePrice: selectedBaseCake.basePrice || 599,
          totalPrice: total,
        });
      } catch (err) {
        console.error("Error calculating price:", err);
      } finally {
        setCalculatingPrice(false);
      }
    };

    calculatePrice();
  }, [
    selectedBaseCake,
    selectedShape,
    selectedSize,
    selectedFlavor,
    selectedFrosting,
    selectedToppings,
  ]);

  // --------- Handlers ----------
  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.find(
        (t) => t._id === topping._id || t.name === topping.name
      );
      if (exists) {
        return prev.filter(
          (t) => !(t._id === topping._id || t.name === topping.name)
        );
      }
      return [...prev, topping];
    });
  };

  const handleReset = () => {
    setSelectedShape(null);
    setSelectedSize(null);
    setSelectedFlavor(null);
    setSelectedFrosting(null);
    setSelectedColor("#FFFFFF");
    setSelectedToppings([]);
    setCustomMessage("");

    if (selectedBaseCake) {
      setPrices({
        basePrice: selectedBaseCake.basePrice || 599,
        totalPrice: selectedBaseCake.basePrice || 599,
      });
    }
  };

  // === ADD TO CART ===
  const handleAddToCart = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to add items to cart");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      // Create summary object
      const summary = {
        shape: selectedShape?.name || "Round",
        size: selectedSize?.name || "1kg",
        flavor: selectedFlavor?.name || "Vanilla",
        frosting: selectedFrosting?.name || "Buttercream",
        toppings:
          selectedToppings.length > 0
            ? selectedToppings.map((t) => t.name).join(", ")
            : "None",
        message: customMessage || "No message",
        color: selectedColor,
        baseCake: selectedBaseCake?.name || "Classic Round Cake",
      };

      const cartProduct = {
        id: `custom-cake-${Date.now()}`,
        name: "Custom Cake",
        price: prices.totalPrice || 599,
        image: selectedBaseCake?.image || "/images/cakes/default-cake.jpg",
        quantity: 1,
        details: summary,
        type: "custom-cake",
      };

      dispatch(addToCart(cartProduct));

      toast.success("Custom cake added to cart! 🎂", {
        icon: "🛒",
        duration: 3000,
      });

      // Optional: Reset after adding to cart
      // handleReset();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  // --------- Helpers for icons ----------
  const shapeIcon = (name) => {
    const lower = (name || "").toLowerCase();
    if (lower.includes("round")) return "circle";
    if (lower.includes("square")) return "square";
    if (lower.includes("heart")) return "favorite";
    if (lower.includes("rectangle")) return "crop_square";
    return "cake";
  };

  // ---------- COLORS ----------
  const colorChoices = [
    { name: "White", value: "#FFFFFF" },
    { name: "Blush", value: "#F5C5B8" },
    { name: "Lavender", value: "#D9AAB7" },
    { name: "Sky Blue", value: "#A7C7E7" },
    { name: "Mint", value: "#C1E1C1" },
    { name: "Pale Yellow", value: "#FFF9C4" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff0f3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e11d48] mx-auto mb-4"></div>
          <p className="text-xl text-[#e11d48] font-semibold">
            Loading cake builder...
          </p>
          <p className="text-[#be123c] mt-2">
            Getting everything ready for your creation
          </p>
        </div>
      </div>
    );
  }

  // === SUMMARY FOR RIGHT PANEL ===
  const summary = {
    shape: selectedShape?.name || "Round",
    size: selectedSize?.name || "1kg",
    flavor: selectedFlavor?.name || "Vanilla",
    frosting: selectedFrosting?.name || "Buttercream",
    toppings:
      selectedToppings.length > 0
        ? selectedToppings.map((t) => t.name).join(", ")
        : "None",
    message: customMessage || "No custom message",
    color: colorChoices.find((c) => c.value === selectedColor)?.name || "White",
    baseCake: selectedBaseCake?.name || "Classic Round Cake",
  };

  // Show price breakdown in debug mode
  const showPriceBreakdown = false;

  // Choose preview shape name: prefer selectedShape, otherwise base cake's name
  const previewShapeName =
    selectedShape?.name || selectedBaseCake?.name || "Round";

  // preview sizing based on shape
  const previewStyleSize = () => {
    const s = previewShapeName.toLowerCase();
    if (s.includes("rectangle") || s.includes("tier")) {
      return { width: 160, height: 90 };
    }
    if (s.includes("heart")) {
      return { width: 140, height: 140 };
    }
    // default round/square
    return { width: 130, height: 130 };
  };

  return (
    <div className="font-sans bg-[#fff0f3] from-amber-50 to-white min-h-screen ">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto ">
        {/* Header */}
        <div className=" relative text-center mb-10 mt-5 w-screen h-[90vh] bg-[url('/Image/bakery.jpg.png')] bg-cover  flex flex-col justify-center items-center -ml-[calc(50vw-50%)]">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">

            Design Your Perfect Cake
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Choose your flavour, size, and decoration to create a cake that makes every celebration unforgettable.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg max-w-md mx-auto">
              <p className="text-amber-800 text-sm">{error}</p>
              <p className="text-amber-600 text-xs mt-1">
                Using default options with static pricing
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT PANEL - Customization Options */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Base Cake Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                1. Choose Base Cake
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(baseCakes.length ? baseCakes : staticBaseCakes).map(
                  (cake) => {
                    const isActive = selectedBaseCake?.id === cake.id;
                    // small shape class for left card
                    const leftShapeClass = getShapeClass(cake.name);
                    const leftWidth =
                      cake.name.toLowerCase().includes("rectangle") ||
                        cake.name.toLowerCase().includes("tier")
                        ? "w-20 h-12"
                        : "w-20 h-20";
                    return (
                      <button
                        key={cake.id}
                        type="button"
                        onClick={() => {
                          setSelectedBaseCake(cake);
                          setPrices((prev) => ({
                            ...prev,
                            basePrice: cake.basePrice,
                            totalPrice:
                              cake.basePrice +
                              (prev.totalPrice - prev.basePrice),
                          }));
                        }}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300${isActive
                          ? "border-[#e11d48] bg-[#fff0f3] shadow-md"
                          : "border-[#e11d48] hover:border-[#fda4af] hover:bg-[#fff0f3]"
                          }`}
                      >
                        <div
                          className={`${leftWidth} ${leftShapeClass} bg-[#e11d48] mb-3 flex items-center justify-center `}
                        >
                          <span className="text-white font-bold text-sm">
                            CAKE
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-700 text-center">
                          {cake.name}
                        </h3>
                        <p className="text-[#e11d48] font-bold mt-1">
                          ₹{cake.basePrice}
                        </p>
                        <p className="text-gray-500 text-xs text-center mt-1">
                          {cake.description}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 2. Shape Selection */}
            {/* <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">2. Choose Shape</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(shapeOptions.length ? shapeOptions : staticShapes).map((shape) => {
                  const isActive = selectedShape?._id === shape._id;
                  return (
                    <button
                      key={shape._id}
                      type="button"
                      onClick={() => setSelectedShape(shape)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        isActive
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-amber-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl text-amber-600 mb-2">
                        {shapeIcon(shape.name)}
                      </span>
                      <h3 className="font-semibold text-amber-900">{shape.name}</h3>
                      <p className="text-amber-700 text-sm mt-1">+₹{shape.price || 0}</p>
                    </button>
                  );
                })}
              </div>
            </div> */}

            {/* 3. Size Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                2. Choose Size
              </h2>
              <div className="flex flex-wrap gap-3">
                {(sizeOptions.length ? sizeOptions : staticSizes).map(
                  (size) => {
                    const isActive = selectedSize?._id === size._id;
                    return (
                      <button
                        key={size._id}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-full border-2 font-medium transition-all duration-300 ${isActive
                          ? "border-black bg-[#e11d48] text-white"
                          : "border-black text-gray-700 hover:border-[#e11d48] hover:bg-[#fff0f3] hover:shadow-md hover:text-[#be123c]"
                          }`}
                      >
                        <span className={isActive ? "text-white" : "text-gray-700"}>
                          {size.name}
                        </span>{" "}
                        <span className={isActive ? "text-white" : "text-[#e11d48]"}>
                          +₹{size.price || 0}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 4. Flavor Selection */}

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl mb-5 font-bold text-gray-700">
                3. Choose Flavor
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(flavorOptions.length ? flavorOptions : staticFlavors).map(
                  (flavor) => {
                    const isActive = selectedFlavor?._id === flavor._id;
                    return (
                      <button
                        key={flavor._id}
                        type="button"
                        onClick={() => setSelectedFlavor(flavor)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${isActive
                          ? "border-black bg-[#e11d48] text-white shadow-md"
                          : "border-black bg-white hover:border-[#e11d48] hover:bg-[#fff0f3] hover:shadow-md hover:text-[#be123c]"
                          }`}
                      >
                        {/* Name */}
                        <h3
                          className={`font-semibold text-center ${isActive ? "text-white" : "text-gray-700"
                            }`}
                        >
                          {flavor.name}
                        </h3>

                        {/* Price */}
                        <p
                          className={`text-sm text-center mt-1 ${isActive ? "text-white" : "text-[#e11d48]"
                            }`}
                        >
                          +₹{flavor.price || 0}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 5. Frosting & Color */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                4. Frosting & Color
              </h2>
              <div className="space-y-6">
                {/* Frosting Options */}
                <div>
                  <h3 className="font-bold text-gray-500 mb-3">
                    Frosting Type
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(frostingOptions.length
                      ? frostingOptions
                      : staticFrostings
                    ).map((frosting) => {
                      const isActive = selectedFrosting?._id === frosting._id;
                      return (
                        <button
                          key={frosting._id}
                          type="button"
                          onClick={() => setSelectedFrosting(frosting)}
                          className={`px-6 py-3 rounded-full border-2 font-medium transition-all duration-300 ${isActive
                            ? "bg-[#e11d48] border-black text-white shadow-md"
                            : "bg-white border-black text-gray-700 hover:border-[#e11d48] hover:bg-[#fff0f3] hover:shadow-md hover:text-[#be123c]"
                            }`}
                        >
                          <span className={isActive ? "text-white" : "text-gray-700"}>
                            {frosting.name}
                          </span>{" "}
                          <span className={isActive ? "text-white" : "text-[#e11d48]"}>
                            +₹{frosting.price || 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Options */}
                <div>
                  <h3 className="font-bold text-gray-500 mb-3">Cake Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {colorChoices.map((color) => {
                      const isActive = selectedColor === color.value;
                      return (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setSelectedColor(color.value)}
                          className={`flex flex-col items-center p-2 rounded-lg transition-all ${isActive ? "ring-2 ring-black ring-offset-2" : ""
                            }`}
                          title={color.name}
                        >
                          <div
                            className="w-10 h-10 rounded-full border border-black"
                            style={{ backgroundColor: color.value }}
                          ></div>

                          <span
                            className={`text-xs mt-1 ${isActive ? "text-[#e11d48]" : "text-gray-500"
                              }`}
                          >
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Toppings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                5. Add Toppings
              </h2>
              <p className="text-gray-500 mb-4">
                Select multiple toppings (each adds to price)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(toppingOptions.length ? toppingOptions : staticToppings).map(
                  (topping) => {
                    const isActive = selectedToppings.some(
                      (t) => t._id === topping._id
                    );
                    return (
                      <button
                        key={topping._id}
                        type="button"
                        onClick={() => toggleTopping(topping)}
                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${isActive
                            ? "border-black bg-[#fff0f3] shadow-md"
                            : "border-black bg-white hover:border-[#e11d48] hover:bg-[#fff0f3] hover:shadow-md hover:text-[#be123c]"
                          }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isActive ? "bg-[#e11d48]" : "bg-gray-100"
                            }`}
                        >
                          <span className={isActive ? "text-white" : "text-[#e11d48]"}>+</span>
                        </div>

                        {/* Name */}
                        <h3
                          className={`font-semibold text-center text-sm ${isActive ? "text-gray-700" : "text-gray-700"
                            }`}
                        >
                          {topping.name}
                        </h3>

                        {/* Price */}
                        <p className="text-xs text-center mt-1 text-[#e11d48]">
                          +₹{topping.price || 0}
                        </p>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 7. Personalize */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                6. Personalize Your Cake
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-500 font-medium mb-2">
                    Custom Message (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Happy Birthday Alex!"
                    className="w-full px-4 py-3 rounded-xl border-2 border-black focus:border-[#fda4af] focus:ring-2 focus:ring-[#be123c] focus:ring-offset-0 outline-none"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-medium mb-2">
                    Special Instructions (optional)
                  </label>
                  <textarea
                    placeholder="Any special requests or dietary requirements..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-black focus:border-[#fda4af] focus:ring-2 focus:ring-[#be123c] focus:ring-offset-0 focus:outline-none"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Summary & Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-black">
                <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
                  Your Cake Summary
                </h2>

                {/* Cake Preview */}
                <div className="mb-6 p-4 bg-[#fff0f3] rounded-xl border border-black">
                  <div className="flex items-center justify-center mb-4">
                    {/* dynamic shaped preview */}
                    <div
                      className={`${getShapeClass(
                        previewShapeName
                      )} flex items-center justify-center bg-[#e11d48] border-4 border-black `}
                      style={{
                        width: previewStyleSize().width + "px",
                        height: previewStyleSize().height + "px",
                        backgroundColor: "#e11d48",
                      }}
                    >
                      <span className="text-white font-bold">CAKE</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Cake:</span>
                      <span className="font-semibold text-gray-500">
                        {summary.baseCake}
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-amber-700">Shape:</span>
                      <span className="font-semibold text-amber-900">{summary.shape}</span>
                    </div> */}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size:</span>
                      <span className="font-semibold text-gray-500">
                        {summary.size}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Flavor:</span>
                      <span className="font-semibold text-gray-500">
                        {summary.flavor}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Frosting:</span>
                      <span className="font-semibold text-gray-500">
                        {summary.frosting}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Color:</span>
                      <span className="font-semibold text-gray-500">
                        {summary.color}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Toppings:</span>
                      <span className="font-semibold text-gray-500">
                        {summary.toppings}
                      </span>
                    </div>
                    {customMessage && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Message:</span>
                        <span className="font-semibold text-gray-500">
                          {customMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">Base Price:</span>
                    <span className="font-semibold text-[#e11d48]">
                      ₹{prices.basePrice}
                    </span>
                  </div>

                  {showPriceBreakdown && (
                    <>
                      {selectedShape && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{selectedShape.name} Shape:</span>
                          <span>+₹{selectedShape.price || 0}</span>
                        </div>
                      )}
                      {selectedSize && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{selectedSize.name} Size:</span>
                          <span>+₹{selectedSize.price || 0}</span>
                        </div>
                      )}
                      {selectedFlavor && selectedFlavor.price > 0 && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{selectedFlavor.name} Flavor:</span>
                          <span>+₹{selectedFlavor.price || 0}</span>
                        </div>
                      )}
                      {selectedFrosting && selectedFrosting.price > 0 && (
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{selectedFrosting.name} Frosting:</span>
                          <span>+₹{selectedFrosting.price || 0}</span>
                        </div>
                      )}
                      {selectedToppings.map((topping, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm text-gray-500"
                        >
                          <span>{topping.name} Topping:</span>
                          <span>+₹{topping.price || 0}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="border-t border-black pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-gray-700">Total Price:</span>
                      <span className="text-[#e11d48]">
                        {calculatingPrice
                          ? "Calculating..."
                          : `₹${prices.totalPrice}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={calculatingPrice}
                    className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${calculatingPrice
                      ? "bg-[#fda4af] cursor-not-allowed text-white"
                      : "bg-[#e11d48] hover:bg-[#be123c] text-white shadow-lg hover:shadow-xl"
                      }`}
                  >
                    {calculatingPrice
                      ? "Calculating..."
                      : "Add to Cart - ₹" + prices.totalPrice}
                  </button>

                  <button
                    onClick={handleReset}
                    className="w-full py-2 rounded-xl border-2 border-[#e11d48] bg-[#e11d48] text-white font-medium hover:bg-[#be123c] hover:text-white transition-all"
                  >
                    Reset Customization
                  </button>
                </div>
              </div>

              {/* Help Text */}

            </div>
          </div>
        </div>
      </main>

      {/* Toast Container Style */}
      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
        }

        /* Heart shape clip */
        .clip-heart {
          clip-path: polygon(
            50% 90%,
            42% 82%,
            36% 75%,
            30% 68%,
            25% 60%,
            20% 52%,
            16% 44%,
            13% 36%,
            11% 28%,
            12% 20%,
            16% 14%,
            22% 10%,
            30% 8%,
            38% 10%,
            44% 14%,
            48% 20%,
            50% 26%,
            52% 20%,
            56% 14%,
            62% 10%,
            70% 8%,
            78% 10%,
            84% 14%,
            88% 20%,
            89% 28%,
            87% 36%,
            84% 44%,
            80% 52%,
            75% 60%,
            70% 68%,
            64% 75%,
            58% 82%
          );
        }
      `}</style>
    </div>
  );
};

export default CustomCakeBuilder;