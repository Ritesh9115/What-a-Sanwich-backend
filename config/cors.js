/**
 * Centralized CORS configuration.
 * Origins are hardcoded because they are tied to the deployed domain.
 * Update this list if domains change.
 */

export const allowedOrigins = [
	"https://sandwichstore.in",
	"https://www.sandwichstore.in",
	"http://localhost:5173",
];

export const corsOptions = {
	origin: (origin, callback) => {
		// Allow non-browser requests (e.g. server-to-server, curl)
		if (!origin) return callback(null, true);

		if (!allowedOrigins.includes(origin)) {
			return callback(
				new Error(
					"The CORS policy for this site does not allow access from the specified Origin."
				),
				false
			);
		}
		return callback(null, true);
	},
	credentials: true,
};
