/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    mainnet: {
                        DEFAULT: "#267D7A",
                        hover: "#328481",
                        lighter: "#A0CDB9",
                    },
                    testnet: {
                        DEFAULT: "#FF7A1E",
                        hover: "#FE812B",
                        lighter: "#EDDF9C",
                    },
                    accent: {
                        DEFAULT: "#F2BB05",
                        hover: "#E3B005",
                    },
                },
                text: {
                    primary: "#000000",
                    secondary: "#000000B3", // #000000 70%
                    tertiary: "#00000080", // #000000 50%
                    inverse: "#F0F0F0",
                    "inverse-secondary": "#F0F0F0B3", // #F0F0F0 70%
                },
                border: {
                    mainnet: {
                        subtle: "#D2CBB5",
                        brand: "#267D7A",
                        black: "#000000",
                    },
                    testnet: {
                        subtle: "#D2CBB5",
                        brand: "#FF7A1E",
                        black: "#000000",
                    },
                },
                surface: {
                    DEFAULT: {
                        "01": "#E5DCB7",
                        "02": "#F7EED4",
                        "03": "#F4E9BD",
                        inverse: "#000000",
                    },
                    hover: {
                        "01": "#D3CAA8",
                        "02": "#E3DBC3",
                        "03": "#E0D6AE",
                        inverse: "#1F1F1F",
                    },
                },
                functional: {
                    success: {
                        DEFAULT: "#0BB859",
                        alpha: "#0BB8591A",
                    },
                    error: {
                        DEFAULT: "#FC3A25",
                        alpha: "#FC3A251A",
                    },
                    warning: {
                        DEFAULT: "#ECB501",
                        alpha: "#ECB5011A",
                    },
                },
                elevator: {
                    mainnet: {
                        frame: "#267D7A",
                        top: "#134C4C",
                        bottom: "#4C8A88",
                        side: "#88BEA6",
                        back: "#A0CDB9",
                    },
                    testnet: {
                        frame: "#FF7A1E",
                        top: "#B4500C",
                        bottom: "#EC8945",
                        side: "#E9D885",
                        back: "#EDDF9C",
                    },
                },
                box: {
                    mint: {
                        DEFAULT: "#AAFAC8",
                        shadow: "#61C888",
                    },
                    orange: {
                        DEFAULT: "#DD8A51",
                        shadow: "#B4500C",
                    },
                    blue: {
                        DEFAULT: "#8FC0CF",
                        shadow: "#66A8BC",
                    },
                    lavender: {
                        DEFAULT: "#B18FCF",
                        shadow: "#88BEA6",
                    },
                    beige: {
                        DEFAULT: "#B18FCF",
                        shadow: "#8D8B71",
                    },
                    rgb: {
                        DEFAULT:
                            "linear-gradient(104deg, #FF5846 0.83%, #66EF9A 50.83%, #87C1FF 100.83%)",
                        shadow: "#E7E7E7",
                    },
                    tape: {
                        DEFAULT: "#EFEFEF",
                        shadow: "#E7E7E7",
                    },
                },
                other: {
                    floor: "#B1AA8E",
                },
            },
            fontFamily: {
                heading: ['"Open Runde"', "Semibold"],
                body: ['"Open Runde"', "Medium"],
                button: ['"Open Runde"', "Medium"],
            },
            animation: {
                "arrow-up": "arrowUp 1s linear infinite",
                "number-flip":
                    "numberFlip 1s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            },
        },
    },
    plugins: [
        function ({ addComponents }) {
            addComponents({
                // Default font sizes (mobile-first)
                ".text-h1": {
                    fontSize: "32px",
                    lineHeight: "120%",
                },
                ".text-h2": {
                    fontSize: "24px",
                    lineHeight: "120%",
                },
                ".text-h3": {
                    fontSize: "20px",
                    lineHeight: "120%",
                },
                ".text-h4": {
                    fontSize: "18px",
                    lineHeight: "120%",
                },
                ".text-body1": {
                    fontSize: "16px",
                    lineHeight: "160%",
                },
                ".text-body2": {
                    fontSize: "14px",
                    lineHeight: "160%",
                },
                ".text-caption": {
                    fontSize: "14px",
                    lineHeight: "120%",
                },
                ".text-footnote": {
                    fontSize: "12px",
                    lineHeight: "120%",
                },
                ".text-button1": {
                    fontSize: "16px",
                    lineHeight: "100%",
                },
                ".text-button2": {
                    fontSize: "16px",
                    lineHeight: "100%",
                },
            });
        },
    ],
};
