using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pos.Domain.Entities;
using System;

namespace Pos.Domain.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasIndex(p => p.Code).IsUnique();

        builder.HasData(
            // --- POS Internal Food & Beverage Products ---
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111101"),
                Code = "0012",
                Name = "Mediterranean Salad",
                Price = 14.50m,
                StandardCost = 5.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 35,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222201"), // Appetizers
                Description = "Fresh organic greens, cherry tomatoes, kalamata olives, feta cheese, and cucumber tossed in our house vinaigrette.",
                Rating = 4.8m,
                ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Standard\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111102"),
                Code = "0054",
                Name = "Signature Burger",
                Price = 18.00m,
                StandardCost = 6.50m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 42,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222202"), // Main Course
                Description = "Premium hand-pressed beef patty, sharp cheddar cheese, caramelized onions, crisp lettuce, tomato, and signature house sauce on a toasted brioche bun.",
                Rating = 4.9m,
                ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Standard\", \"Double Patty\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111103"),
                Code = "0098",
                Name = "Artisan Latte",
                Price = 5.25m,
                StandardCost = 1.50m,
                MinStockThreshold = 20,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 80,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222203"), // Beverages
                Description = "Rich double-shot espresso layered with steamed whole milk and topped with delicate micro-foam art.",
                Rating = 4.7m,
                ImageUrl = "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111104"),
                Code = "0112",
                Name = "Glazed Donut",
                Price = 3.50m,
                StandardCost = 1.00m,
                MinStockThreshold = 12,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 50,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222204"), // Desserts
                Description = "Light and fluffy ring donut dipped in a sweet sugar glaze that melts in your mouth.",
                Rating = 4.6m,
                ImageUrl = "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Standard\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111105"),
                Code = "0087",
                Name = "Mixed Grill",
                Price = 24.00m,
                StandardCost = 9.00m,
                MinStockThreshold = 8,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 3,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222202"), // Main Course
                Description = "A meat lover's platter featuring grilled steak slices, lamb chop, chicken breast, and grilled vegetables served with a peppercorn sauce.",
                Rating = 4.9m,
                ImageUrl = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Standard\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111106"),
                Code = "0041",
                Name = "Truffle Fries",
                Price = 8.50m,
                StandardCost = 2.50m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 65,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222201"), // Appetizers
                Description = "Crispy golden french fries tossed in aromatic white truffle oil, salt, and freshly grated parmesan cheese, served with garlic aioli.",
                Rating = 4.8m,
                ImageUrl = "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Standard\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111107"),
                Code = "0203",
                Name = "Iced Matcha Latte",
                Price = 6.00m,
                StandardCost = 2.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 2,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222203"), // Beverages
                Description = "Premium Japanese ceremonial Uji matcha whisked and poured over cold milk and ice.",
                Rating = 4.7m,
                ImageUrl = "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Standard\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111108"),
                Code = "0319",
                Name = "Ribeye Steak 300g",
                Price = 38.00m,
                StandardCost = 15.00m,
                MinStockThreshold = 12,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 4,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222202"), // Main Course
                Description = "USDA Prime Ribeye steak grilled to your liking, seasoned with sea salt and black pepper, served with a side of garlic butter.",
                Rating = 4.9m,
                ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
                GalleryJson = "[\"https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80\"]",
                SizesJson = "[\"Standard\"]",
                ColorsJson = "[]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = ""
            },

            // --- E-Commerce Apparel Products ---
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111201"),
                Code = "C001",
                Name = "T-shirt with Tape Details",
                Price = 120.00m,
                StandardCost = 30.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 100,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Minimalist cotton t-shirt featuring distinct contrast tape details along the shoulders and sleeves. Comfortable fit for everyday wear.",
                Rating = 4.5m,
                ImageUrl = "/images/pic1.png",
                GalleryJson = "[\"/images/pic1.png\", \"/images/pic10.png\", \"/images/pic11.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]",
                ColorsJson = "[{\"name\":\"Brown\",\"code\":\"bg-[#4F4631]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"},{\"name\":\"Green\",\"code\":\"bg-[#314F36]\"}]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111202"),
                Code = "C002",
                Name = "Skinny Fit Jeans",
                Price = 260.00m,
                StandardCost = 80.00m,
                MinStockThreshold = 5,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 75,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Classic denim skinny jeans with a bit of stretch for maximum comfort. Features a five-pocket design and zip fly with button closure.",
                Rating = 3.5m,
                ImageUrl = "/images/pic2.png",
                GalleryJson = "[\"/images/pic2.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\"]",
                ColorsJson = "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"}]",
                DiscountPercentage = 20m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111203"),
                Code = "C003",
                Name = "Checkered Shirt",
                Price = 180.00m,
                StandardCost = 50.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 45,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Stylish long-sleeve checkered button-down shirt. Perfect for layering over a graphic tee or wearing on its own.",
                Rating = 4.5m,
                ImageUrl = "/images/pic3.png",
                GalleryJson = "[\"/images/pic3.png\"]",
                SizesJson = "[\"Medium\", \"Large\"]",
                ColorsJson = "[{\"name\":\"Red\",\"code\":\"bg-[#ff0000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111204"),
                Code = "C004",
                Name = "Sleeve Striped T-shirt",
                Price = 160.00m,
                StandardCost = 35.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 110,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Breathable athletic-style crewneck t-shirt with signature dual stripes around the sleeves.",
                Rating = 4.5m,
                ImageUrl = "/images/pic4.png",
                GalleryJson = "[\"/images/pic4.png\", \"/images/pic10.png\", \"/images/pic11.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]",
                ColorsJson = "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]",
                DiscountPercentage = 30m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111205"),
                Code = "C005",
                Name = "Vertical Striped Shirt",
                Price = 232.00m,
                StandardCost = 70.00m,
                MinStockThreshold = 8,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 30,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Breathable linen shirt with thin vertical stripes. Roll up the sleeves for a summer-ready casual resort look.",
                Rating = 5.0m,
                ImageUrl = "/images/pic5.png",
                GalleryJson = "[\"/images/pic5.png\", \"/images/pic10.png\", \"/images/pic11.png\"]",
                SizesJson = "[\"Medium\", \"Large\", \"X-Large\"]",
                ColorsJson = "[{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"}]",
                DiscountPercentage = 20m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111206"),
                Code = "C006",
                Name = "Courage Graphic T-shirt",
                Price = 145.00m,
                StandardCost = 30.00m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 90,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Premium heavyweight cotton t-shirt with a bold graphic print on the chest reading 'Courage'.",
                Rating = 4.0m,
                ImageUrl = "/images/pic6.png",
                GalleryJson = "[\"/images/pic6.png\", \"/images/pic10.png\", \"/images/pic11.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\"]",
                ColorsJson = "[{\"name\":\"Orange\",\"code\":\"bg-[#ffa500]\"},{\"name\":\"Black\",\"code\":\"bg-[#000000]\"}]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111207"),
                Code = "C007",
                Name = "Loose Fit Bermuda Shorts",
                Price = 80.00m,
                StandardCost = 20.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 40,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Relaxed-fit shorts sitting just above the knee, crafted in durable twill cotton with comfortable wide leg openings.",
                Rating = 3.0m,
                ImageUrl = "/images/pic7.png",
                GalleryJson = "[\"/images/pic7.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\"]",
                ColorsJson = "[{\"name\":\"Blue\",\"code\":\"bg-[#0000ff]\"},{\"name\":\"Brown\",\"code\":\"bg-[#a52a2a]\"}]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111208"),
                Code = "C008",
                Name = "Faded Skinny Jeans",
                Price = 210.00m,
                StandardCost = 65.00m,
                MinStockThreshold = 5,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 60,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Distressed skinny jeans with character-rich faded washes at the thighs and knees.",
                Rating = 4.5m,
                ImageUrl = "/images/pic8.png",
                GalleryJson = "[\"/images/pic8.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]",
                ColorsJson = "[{\"name\":\"Grey\",\"code\":\"bg-[#808080]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"}]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111212"),
                Code = "C012",
                Name = "Polo with Contrast Trims",
                Price = 242.00m,
                StandardCost = 75.00m,
                MinStockThreshold = 8,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 35,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Classic pique polo shirt detailed with refined contrast piping on the collar and sleeve cuffs.",
                Rating = 4.0m,
                ImageUrl = "/images/pic12.png",
                GalleryJson = "[\"/images/pic12.png\", \"/images/pic10.png\", \"/images/pic11.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\"]",
                ColorsJson = "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]",
                DiscountPercentage = 20m,
                DiscountAmount = 0m,
                DressStyle = "Formal"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111213"),
                Code = "C013",
                Name = "Gradient Graphic T-shirt",
                Price = 145.00m,
                StandardCost = 30.00m,
                MinStockThreshold = 15,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 85,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Cotton crewneck styled with an eye-catching soft gradient color blend fading down the body.",
                Rating = 3.5m,
                ImageUrl = "/images/pic13.png",
                GalleryJson = "[\"/images/pic13.png\", \"/images/pic10.png\", \"/images/pic11.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]",
                ColorsJson = "[{\"name\":\"Pink\",\"code\":\"bg-[#ffc0cb]\"},{\"name\":\"Purple\",\"code\":\"bg-[#800080]\"}]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = "Gym"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111214"),
                Code = "C014",
                Name = "Polo with Tipping Details",
                Price = 180.00m,
                StandardCost = 50.00m,
                MinStockThreshold = 10,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 40,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Slim-fit collared polo shirt featuring contrast colored tipping bands around the edges.",
                Rating = 4.5m,
                ImageUrl = "/images/pic14.png",
                GalleryJson = "[\"/images/pic14.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\"]",
                ColorsJson = "[{\"name\":\"Green\",\"code\":\"bg-[#008000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]",
                DiscountPercentage = 0m,
                DiscountAmount = 0m,
                DressStyle = "Formal"
            },
            new Product
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111215"),
                Code = "C015",
                Name = "Black Striped T-shirt",
                Price = 150.00m,
                StandardCost = 35.00m,
                MinStockThreshold = 12,
                IsVatInclusive = true,
                IsActive = true,
                Version = 1,
                UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                StockQuantity = 95,
                CategoryId = Guid.Parse("22222222-2222-2222-2222-222222222205"), // Apparel
                Description = "Classic black t-shirt printed with horizontal white stripes. Easy to dress up under a blazer or dress down with shorts.",
                Rating = 5.0m,
                ImageUrl = "/images/pic15.png",
                GalleryJson = "[\"/images/pic15.png\"]",
                SizesJson = "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]",
                ColorsJson = "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"}]",
                DiscountPercentage = 30m,
                DiscountAmount = 0m,
                DressStyle = "Casual"
            }
        );
    }
}
