import mongoose from "mongoose";
import dotenv from "dotenv";
import { Menu } from "./models/Menu.js";
import { Category } from "./models/Category.js";

dotenv.config();

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI;
const DEFAULT_IMG =
	"https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg";

// ---------------------------------------------------------
// DATA: ALL 108+ ITEMS
// ---------------------------------------------------------
const rawMenuItems = [
	// ==========================================
	// 1. SUBMARINE SANDWICHES (Oregano)
	// ==========================================

	{
		name: "Aloo Masala Sandwich",
		category: "Submarine Sandwiches",
		subCategory: "Oregano Footlong Bread",
		description:
			"Spiced potato mash with Indian herbs, served in a fresh oregano footlong bread.",
		variants: [
			{ size: "6 Inches", price: 70 },
			{ size: "12 Inches", price: 110 },
		],
	},
	{
		name: "Spinach & Corn Sandwich",
		category: "Submarine Sandwiches",
		subCategory: "Oregano Footlong Bread",
		description:
			"A healthy and creamy blend of fresh spinach and sweet corn in oregano bread.",
		variants: [
			{ size: "6 Inches", price: 80 },
			{ size: "12 Inches", price: 130 },
		],
	},
	{
		name: "Mozzarella Cheesy Fingers",
		category: "Submarine Sandwiches",
		subCategory: "Oregano Footlong Bread",
		description:
			"Fried mozzarella cheese fingers loaded inside a toasted oregano footlong.",
		variants: [
			{ size: "6 Inches", price: 110 },
			{ size: "12 Inches", price: 150 },
		],
	},
	{
		name: "Crispy Nachos and Corn",
		category: "Submarine Sandwiches",
		subCategory: "Oregano Footlong Bread",
		description:
			"Crunchy Mexican nachos paired with sweet corn and sauces for a perfect crunch.",
		variants: [
			{ size: "6 Inches", price: 120 },
			{ size: "12 Inches", price: 160 },
		],
	},
	{
		name: "Paneer Crackling",
		category: "Submarine Sandwiches",
		subCategory: "Oregano Footlong Bread",
		description:
			"Crispy fried paneer chunks tossed in spices and layered in soft bread.",
		variants: [
			{ size: "6 Inches", price: 130 },
			{ size: "12 Inches", price: 180 },
		],
	},
	{
		name: "Paneer Masala",
		category: "Submarine Sandwiches",
		subCategory: "Oregano Footlong Bread",
		description:
			"Soft cottage cheese cubes cooked in a rich, spicy masala gravy sauce.",
		variants: [
			{ size: "6 Inches", price: 140 },
			{ size: "12 Inches", price: 200 },
		],
	},

	// ==========================================
	// 2. SUBMARINE SANDWICHES (Multigrain)
	// ==========================================
	{
		name: "Aloo Masala (Multigrain)",
		category: "Submarine Sandwiches",
		subCategory: "Multigrain Bread",
		description:
			"Classic spiced potato filling served in a healthy, fiber-rich multigrain loaf.",
		variants: [
			{ size: "4 Inches", price: 80 },
			{ size: "8 Inches", price: 120 },
		],
	},
	{
		name: "Spinach & Corn (Multigrain)",
		category: "Submarine Sandwiches",
		subCategory: "Multigrain Bread",
		description:
			"Nutritious spinach and corn filling in a guilt-free multigrain bread.",
		variants: [
			{ size: "4 Inches", price: 90 },
			{ size: "8 Inches", price: 140 },
		],
	},
	{
		name: "Mozzarella Cheesy Fingers (Multigrain)",
		category: "Submarine Sandwiches",
		subCategory: "Multigrain Bread",
		description:
			"Cheesy goodness meets health with mozzarella fingers in multigrain bread.",
		variants: [
			{ size: "4 Inches", price: 120 },
			{ size: "8 Inches", price: 160 },
		],
	},
	{
		name: "Crispy Nachos and Corn (Multigrain)",
		category: "Submarine Sandwiches",
		subCategory: "Multigrain Bread",
		description:
			"The perfect crunch of nachos and corn served in healthy multigrain bread.",
		variants: [
			{ size: "4 Inches", price: 130 },
			{ size: "8 Inches", price: 170 },
		],
	},
	{
		name: "Paneer Crackling (Multigrain)",
		category: "Submarine Sandwiches",
		subCategory: "Multigrain Bread",
		description: "Crispy paneer bites served in a wholesome multigrain sub.",
		variants: [
			{ size: "4 Inches", price: 140 },
			{ size: "8 Inches", price: 190 },
		],
	},
	{
		name: "Paneer Masala (Multigrain)",
		category: "Submarine Sandwiches",
		subCategory: "Multigrain Bread",
		description:
			"Spicy paneer masala filling inside a nutritious multigrain loaf.",
		variants: [
			{ size: "4 Inches", price: 140 },
			{ size: "8 Inches", price: 210 },
		],
	},

	// ==========================================
	// 3. WHAT' A BURGER!
	// ==========================================
	{
		name: "Aloo Masala Burger",
		category: "What' a Burger!",
		description:
			"A classic Indian style burger with a spiced potato patty and fresh veggies.",
		variants: [{ size: "Regular", price: 60 }],
	},
	{
		name: "Spinach and Corn Burger",
		category: "What' a Burger!",
		description:
			"A green delight featuring a spinach and corn patty with creamy mayo.",
		variants: [{ size: "Regular", price: 70 }],
	},
	{
		name: "Makhani Loaded Burger",
		category: "What' a Burger!",
		description:
			"Fusion burger loaded with rich makhani sauce and a crispy patty.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Spicy Tandoori Burger",
		category: "What' a Burger!",
		description:
			"Smoky tandoori sauce drizzled over a spicy patty for a fiery taste.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Cheese Corn Burger",
		category: "What' a Burger!",
		description: "Sweet corn patty topped with a slice of melting cheese.",
		variants: [{ size: "Regular", price: 90 }],
	},
	{
		name: "Mexican Jalapeno Burger",
		category: "What' a Burger!",
		description:
			"Spicy jalapenos and Mexican salsa make this burger a zest bomb.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Spicy Paneer Crackling Burger",
		category: "What' a Burger!",
		description:
			"Crispy fried paneer patty with spicy sauces and fresh lettuce.",
		variants: [{ size: "Regular", price: 110 }],
	},
	{
		name: "Jumbo Burger",
		category: "What' a Burger!",
		description:
			"Double patty, double cheese, and double the fun for big appetites.",
		variants: [{ size: "Regular", price: 120 }],
	},

	// ==========================================
	// 4. WHAT' A PAV!
	// ==========================================
	{
		name: "Classic Vada Pav",
		category: "What' a Pav!",
		description:
			"The authentic Mumbai street food taste with dry garlic chutney.",
		variants: [{ size: "Regular", price: 50 }],
	},
	{
		name: "Cheesy Masala Vada Pav",
		category: "What' a Pav!",
		description:
			"Classic vada pav enhanced with melted cheese and butter masala.",
		variants: [{ size: "Regular", price: 60 }],
	},
	{
		name: "Tandoori Vada Pav",
		category: "What' a Pav!",
		description: "Vada pav served with a smoky tandoori mayo twist.",
		variants: [{ size: "Regular", price: 70 }],
	},
	{
		name: "Spicy Peri Peri Vada Pav",
		category: "What' a Pav!",
		description:
			"Hot and spicy peri peri seasoning dusted over a hot vada pav.",
		variants: [{ size: "Regular", price: 80 }],
	},

	// ==========================================
	// 5. CHEESE TORTILLA WRAPS
	// ==========================================
	{
		name: "Avenger Aloo Masala Hero Warp",
		category: "Cheese Tortilla Wraps",
		description:
			"Soft tortilla wrap filled with spiced aloo masala and veggies.",
		variants: [{ size: "Regular", price: 60 }],
	},
	{
		name: "Cheese Aloo Masala Hero Warp",
		category: "Cheese Tortilla Wraps",
		description: "Aloo masala wrap loaded with liquid cheese.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Popeye Spinach & Corn Hero Warp",
		category: "Cheese Tortilla Wraps",
		description:
			"Power-packed spinach and corn filling wrapped in a soft tortilla.",
		variants: [{ size: "Regular", price: 90 }],
	},
	{
		name: "Mr. Fantastic Cheesy Finger Warp",
		category: "Cheese Tortilla Wraps",
		description: "Mozzarella cheese fingers wrapped up with tangy sauces.",
		variants: [{ size: "Regular", price: 110 }],
	},
	{
		name: "Crispy Nachos and Corn Warp",
		category: "Cheese Tortilla Wraps",
		description: "A crunchy wrap filled with nachos, corn, and salsa.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Hulk Paneer Crackling Hero Warp",
		category: "Cheese Tortilla Wraps",
		description: "Big chunks of crispy paneer wrapped for a protein punch.",
		variants: [{ size: "Regular", price: 140 }],
	},

	// ==========================================
	// 6. CHEF'S SPECIAL
	// ==========================================
	{
		name: "Pav Bhaji",
		category: "Chef's Special",
		description:
			"Buttery mashed vegetable curry served with soft buttered pav.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Fried Rice",
		category: "Chef's Special",
		description: "Indo-Chinese style stir-fried rice with fresh vegetables.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Paneer Chilli Fried Rice",
		category: "Chef's Special",
		description:
			"Spicy fried rice tossed with soft paneer cubes and chilli sauce.",
		variants: [{ size: "Regular", price: 150 }],
	},
	{
		name: "Biryani",
		category: "Chef's Special",
		description: "Aromatic basmati rice cooked with spices and vegetables.",
		variants: [{ size: "Regular", price: 150 }],
	},
	{
		name: "Special Paneer Biryani",
		category: "Chef's Special",
		description: "Royal biryani loaded with marinated paneer chunks.",
		variants: [{ size: "Regular", price: 250 }],
	},

	// ==========================================
	// 7. LOADED FRIES
	// ==========================================
	{
		name: "Tintin's Favourite French Fries",
		category: "Loaded Fries",
		description: "Classic golden crispy salted french fries.",
		variants: [{ size: "Regular", price: 70 }],
	},
	{
		name: "Road Runner Chipotle Fries",
		category: "Loaded Fries",
		description: "Fries topped with spicy and smoky chipotle sauce.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Jerry Cheesy Fries",
		category: "Loaded Fries",
		description: "Crispy fries drowned in a pool of liquid cheese.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Donald's Peri Peri Fries",
		category: "Loaded Fries",
		description: "Spicy peri-peri masala dusted fries for a hot kick.",
		variants: [{ size: "Regular", price: 100 }],
	},

	// ==========================================
	// 8. MOMO
	// ==========================================
	{
		name: "Vegetable Momo",
		category: "Momo",
		description: "Traditional dumplings filled with mixed vegetables.",
		variants: [
			{ size: "Steam", price: 100 },
			{ size: "Fried", price: 120 },
		],
	},
	{
		name: "Paneer Momo",
		category: "Momo",
		description: "Dumplings stuffed with grated paneer and mild spices.",
		variants: [
			{ size: "Steam", price: 140 },
			{ size: "Fried", price: 160 },
		],
	},

	// ==========================================
	// 9. TANDOORI MOMO
	// ==========================================
	{
		name: "Tandoori Momo",
		category: "Tandoori Momo",
		description:
			"Momos marinated in tandoori masala and grilled over charcoal.",
		variants: [{ size: "Regular", price: 110 }],
	},
	{
		name: "Malai Momo",
		category: "Tandoori Momo",
		description: "Creamy, rich momos marinated in cashew and cream paste.",
		variants: [{ size: "Regular", price: 130 }],
	},
	{
		name: "Afgani Momo",
		category: "Tandoori Momo",
		description: "Mild and aromatic white gravy tandoori momos.",
		variants: [{ size: "Regular", price: 130 }],
	},

	// ==========================================
	// 10. SPRING ROLL
	// ==========================================
	{
		name: "Noodle Spring Roll",
		category: "Spring Roll",
		description: "Crispy rolls stuffed with hakka noodles.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Vegetable Spring Roll",
		category: "Spring Roll",
		description: "Golden fried rolls filled with shredded vegetables.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Special Cheese and Corn",
		category: "Spring Roll",
		description: "Premium rolls filled with melting cheese and sweet corn.",
		variants: [{ size: "Regular", price: 120 }],
	},

	// ==========================================
	// 11. NOODLES
	// ==========================================
	{
		name: "Vegetable Noodles",
		category: "Noodles",
		description: "Simple and tasty stir-fried noodles with veggies.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Hakka Noodles",
		category: "Noodles",
		description: "Classic street style hakka noodles tossed in wok.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Paneer Noodles",
		category: "Noodles",
		description: "Noodles tossed with soft paneer cubes.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Singapuri Noodles",
		category: "Noodles",
		description: "Spicy curry-flavored noodles with a yellow tint.",
		variants: [{ size: "Regular", price: 140 }],
	},
	{
		name: "Manchurian (Dry/Gravy)",
		category: "Noodles",
		description: "Veg manchurian balls in your choice of dry or gravy style.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Manchurian Noodle Bowl",
		category: "Noodles",
		description:
			"A complete meal bowl of noodles topped with manchurian gravy.",
		variants: [{ size: "Regular", price: 200 }],
	},

	// ==========================================
	// 12. CHOTI MOTI BHUKH
	// ==========================================
	{
		name: "Chilly Potato",
		category: "Choti Moti Bhukh",
		description: "Crispy potato fingers tossed in spicy chilli sauce.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Honey Chilly Potato",
		category: "Choti Moti Bhukh",
		description: "Potatoes tossed in a sweet and spicy honey chilli glaze.",
		variants: [{ size: "Regular", price: 140 }],
	},
	{
		name: "Crispy Corn",
		category: "Choti Moti Bhukh",
		description: "Fried corn kernels seasoned with salt and pepper.",
		variants: [{ size: "Regular", price: 140 }],
	},
	{
		name: "Chilly Mushroom",
		category: "Choti Moti Bhukh",
		description: "Button mushrooms cooked in spicy chinese gravy.",
		variants: [{ size: "Regular", price: 140 }],
	},
	{
		name: "Chilly Paneer",
		category: "Choti Moti Bhukh",
		description:
			"Cottage cheese cubes tossed with capsicum and onion in chilli sauce.",
		variants: [{ size: "Regular", price: 180 }],
	},
	{
		name: "Peanut Chaat",
		category: "Choti Moti Bhukh",
		description:
			"Healthy snack of peanuts mixed with chopped onions and tomatoes.",
		variants: [{ size: "Regular", price: 120 }],
	},

	// ==========================================
	// 13. PENNE PASTA
	// ==========================================
	{
		name: "Red Sauce Pasta",
		category: "Penne Pasta",
		description: "Penne pasta cooked in tangible arrabbiata tomato sauce.",
		variants: [{ size: "Regular", price: 150 }],
	},
	{
		name: "Mix Sauce Pasta",
		category: "Penne Pasta",
		description: "The best of both worlds - a blend of red and white sauce.",
		variants: [{ size: "Regular", price: 180 }],
	},
	{
		name: "Special White Sauce Pasta",
		category: "Penne Pasta",
		description: "Creamy cheesy alfredo sauce pasta with herbs.",
		variants: [{ size: "Regular", price: 200 }],
	},

	// ==========================================
	// 14. DRAGON'S BEARD MAGGIE
	// ==========================================
	{
		name: "Plain Maggie",
		category: "Dragon's Beard Maggie",
		description: "Your favorite 2-minute noodles, cooked to perfection.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Vegetables Maggie",
		category: "Dragon's Beard Maggie",
		description: "Maggie loaded with fresh carrots, peas, and onions.",
		variants: [{ size: "Regular", price: 90 }],
	},
	{
		name: "Chesse Corn Maggie",
		category: "Dragon's Beard Maggie",
		description: "Cheesy maggie with sweet corn kernels.",
		variants: [{ size: "Regular", price: 110 }],
	},
	{
		name: "Tandoori Maggie",
		category: "Dragon's Beard Maggie",
		description: "Maggie with a smoky tandoori flavor twist.",
		variants: [{ size: "Regular", price: 110 }],
	},
	{
		name: "Masala Makhani Maggie",
		category: "Dragon's Beard Maggie",
		description: "Rich buttery makhani sauce mixed with maggie.",
		variants: [{ size: "Regular", price: 110 }],
	},
	{
		name: "Garlic Chilly Cheesy Maggie",
		category: "Dragon's Beard Maggie",
		description: "Spicy garlic flavor with melting cheese.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Paneer Chesse Maggie",
		category: "Dragon's Beard Maggie",
		description: "Maggie topped with paneer cubes and cheese.",
		variants: [{ size: "Regular", price: 140 }],
	},

	// ==========================================
	// 15. CHAAP (TANDOORI TIZORI)
	// ==========================================
	{
		name: "Tandoori Chaap",
		category: "Chaap",
		description:
			"Soy chaap marinated in yogurt and spices, grilled in tandoor.",
		variants: [
			{ size: "Half", price: 130 },
			{ size: "Full", price: 230 },
		],
	},
	{
		name: "Haryali Chaap",
		category: "Chaap",
		description: "Chaap marinated in green mint and coriander paste.",
		variants: [
			{ size: "Half", price: 130 },
			{ size: "Full", price: 230 },
		],
	},
	{
		name: "Malai Chaap",
		category: "Chaap",
		description: "Mild and creamy soy chaap with cashew paste.",
		variants: [
			{ size: "Half", price: 140 },
			{ size: "Full", price: 250 },
		],
	},
	{
		name: "Afghani Chaap",
		category: "Chaap",
		description: "Rich white gravy marinade chaap with aromatic spices.",
		variants: [
			{ size: "Half", price: 140 },
			{ size: "Full", price: 250 },
		],
	},
	{
		name: "Lemon Chaap",
		category: "Chaap",
		description: "Tangy lemon flavored roasted chaap.",
		variants: [
			{ size: "Half", price: 130 },
			{ size: "Full", price: 230 },
		],
	},
	{
		name: "Achari Chaap",
		category: "Chaap",
		description: "Pickle flavored spicy chaap.",
		variants: [
			{ size: "Half", price: 130 },
			{ size: "Full", price: 230 },
		],
	},
	{
		name: "Kurkure Chaap",
		category: "Chaap",
		description: "Crunchy fried chaap with a crispy coating.",
		variants: [{ size: "Full", price: 140 }],
	},
	{
		name: "Paneer Tikka",
		category: "Chaap",
		description: "Classic marinated paneer cubes grilled to perfection.",
		variants: [{ size: "Full", price: 250 }],
	},
	{
		name: "Mushroom Tikka",
		category: "Chaap",
		description: "Whole mushrooms marinated and grilled tandoori style.",
		variants: [{ size: "Full", price: 180 }],
	},

	// ==========================================
	// 16. ROLLS
	// ==========================================
	{
		name: "Malai Chaap Roll",
		category: "Rolls",
		description: "Creamy malai chaap wrapped in a soft roomali roti.",
		variants: [{ size: "Regular", price: 130 }],
	},
	{
		name: "Tandoori Chaap Roll",
		category: "Rolls",
		description: "Spicy tandoori chaap filling in a roll.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Haryali Chaap Roll",
		category: "Rolls",
		description: "Green herb marinated chaap roll.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Afghani Chaap Roll",
		category: "Rolls",
		description: "Rich and mild afghani chaap roll.",
		variants: [{ size: "Regular", price: 130 }],
	},
	{
		name: "Lemon Chaap Roll",
		category: "Rolls",
		description: "Tangy lemon chaap wrapped in a roll.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Achari Chaap Roll",
		category: "Rolls",
		description: "Pickled spice flavored chaap roll.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Paneer Tikka Roll",
		category: "Rolls",
		description: "Smoky paneer tikka pieces in a delicious roll.",
		variants: [{ size: "Regular", price: 140 }],
	},
	{
		name: "Mushroom Tikka Roll",
		category: "Rolls",
		description: "Juicy mushroom tikka wrapped up.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Noodle Roll",
		category: "Rolls",
		description: "Roll filled with spicy chowmein noodles.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Manchurian Roll",
		category: "Rolls",
		description: "Indo-chinese manchurian balls crushed inside a roll.",
		variants: [{ size: "Regular", price: 120 }],
	},

	// ==========================================
	// 17. SUMMER COOLERS
	// ==========================================
	{
		name: "Mint Mojito",
		category: "Summer Coolers",
		description: "Cool and refreshing mint and lime mocktail.",
		variants: [{ size: "Regular", price: 70 }],
	},
	{
		name: "Green Apple Mojito",
		category: "Summer Coolers",
		description: "Sweet and sour green apple flavored fizz.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Blood Orange",
		category: "Summer Coolers",
		description: "Exotic blood orange cooler.",
		variants: [{ size: "Regular", price: 90 }],
	},
	{
		name: "Watermelon",
		category: "Summer Coolers",
		description: "Fresh watermelon flavored summer drink.",
		variants: [{ size: "Regular", price: 70 }],
	},
	{
		name: "Blue Currant",
		category: "Summer Coolers",
		description: "Electric blue refreshing beverage.",
		variants: [{ size: "Regular", price: 70 }],
	},

	// ==========================================
	// 18. SHAKES
	// ==========================================
	{
		name: "Mango Masti",
		category: "Shakes",
		description: "Thick and creamy mango milkshake.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Sexy Strawberry",
		category: "Shakes",
		description: "Sweet strawberry shake with pink hues.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Luchi Lychee",
		category: "Shakes",
		description: "Exotic lychee fruit shake.",
		variants: [{ size: "Regular", price: 80 }],
	},
	{
		name: "Mr. Butterscotch",
		category: "Shakes",
		description: "Crunchy butterscotch flavored milk shake.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Kiwi Shake",
		category: "Shakes",
		description: "Tangy and sweet kiwi fruit shake.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Kit Kat Happiness",
		category: "Shakes",
		description: "Chocolate shake blended with Kit Kat bars.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Oreo Monster",
		category: "Shakes",
		description: "Thick shake loaded with Oreo cookies.",
		variants: [{ size: "Regular", price: 120 }],
	},
	{
		name: "Chocolate Shake",
		category: "Shakes",
		description: "Classic rich chocolate shake.",
		variants: [{ size: "Regular", price: 100 }],
	},
	{
		name: "Beguhuna Badam Milk",
		category: "Shakes",
		description: "Traditional almond milk with saffron and nuts.",
		variants: [{ size: "Regular", price: 70 }],
	},
	{
		name: "Sandwich Special Cold Coffee",
		category: "Shakes",
		description: "Our signature cold coffee blend.",
		variants: [{ size: "Regular", price: 80 }],
	},

	// ==========================================
	// 19. BEVERAGES
	// ==========================================
	{
		name: "Soft Drink",
		category: "Beverages",
		description: "Chilled carbonated soft drink.",
		variants: [{ size: "Regular", price: 50 }], // Price estimated, usually MRP or fixed
	},
	{
		name: "Hot Coffee",
		category: "Beverages",
		description: "Steaming hot cappuccino style coffee.",
		variants: [{ size: "Regular", price: 50 }],
	},
	{
		name: "Masala Tea",
		category: "Beverages",
		description: "Indian spiced chai.",
		variants: [{ size: "Regular", price: 50 }],
	},
	{
		name: "Mineral Water",
		category: "Beverages",
		description: "Bottled mineral water.",
		variants: [{ size: "Regular", price: 20 }], // Estimated
	},
];

// ---------------------------------------------------------
// SEED SCRIPT LOGIC
// ---------------------------------------------------------
const seedDB = async () => {
	try {
		console.log("🚀 Connecting to MongoDB...");
		await mongoose.connect(MONGO_URI);
		console.log("✅ Connected.");

		// 1. EXTRACT UNIQUE CATEGORIES
		const uniqueCategories = [
			...new Set(rawMenuItems.map((item) => item.category)),
		];
		console.log(`📋 Found ${uniqueCategories.length} Categories.`);

		// 2. CLEAR EXISTING DATA
		console.log("🧹 Clearing old data...");
		await Menu.deleteMany({});
		await Category.deleteMany({});

		// 3. INSERT CATEGORIES
		console.log("📂 Seeding Categories...");
		const categoryDocs = uniqueCategories.map((name) => ({
			name,
			isActive: true,
		}));
		await Category.insertMany(categoryDocs);

		// 4. PREPARE & INSERT MENU ITEMS
		console.log("🍔 Seeding Menu Items...");

		// Helper to generate code: SUB-100, SUB-101
		const categoryCounters = {};

		const menuDocs = rawMenuItems.map((item) => {
			// Initialize counter for this category if not exists
			if (!categoryCounters[item.category]) {
				categoryCounters[item.category] = 100;
			}

			// Create Prefix (first 3 chars of category, uppercase)
			// e.g., "Submarine Sandwiches" -> "SUB"
			const codePrefix = item.category
				.replace(/[^a-zA-Z]/g, "")
				.substring(0, 3)
				.toUpperCase();
			const count = categoryCounters[item.category]++;
			const uniqueCode = `${codePrefix}-${count}`;

			return {
				uniCode: uniqueCode,
				name: item.name,
				image: DEFAULT_IMG, // Using the placeholder as requested
				description: item.description,
				category: item.category,
				subCategory: item.subCategory || "", // Use empty string if no subCategory
				variants: item.variants,
				isVeg: true, // Default
				isAvailable: true, // Default
				preparationTime: 10, // Default
				rating: 0, // Default
			};
		});

		await Menu.insertMany(menuDocs);

		console.log(`✅ Successfully seeded ${menuDocs.length} menu items!`);
		console.log("✨ Database is ready.");
		process.exit(0);
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
};

seedDB();
