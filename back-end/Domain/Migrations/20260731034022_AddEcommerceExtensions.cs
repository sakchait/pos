using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Pos.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddEcommerceExtensions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ColorsJson",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPercentage",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "DressStyle",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GalleryJson",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Rating",
                table: "Products",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "SizesJson",
                table: "Products",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "ProductReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProductId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductReviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductReviews_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Code", "IsActive", "Name" },
                values: new object[] { new Guid("22222222-2222-2222-2222-222222222205"), "APP-CLOTH", true, "Apparel" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111101"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "Fresh organic greens, cherry tomatoes, kalamata olives, feta cheese, and cucumber tossed in our house vinaigrette.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80", 4.8m, "[\"Standard\"]" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111102"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "Premium hand-pressed beef patty, sharp cheddar cheese, caramelized onions, crisp lettuce, tomato, and signature house sauce on a toasted brioche bun.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80", 4.9m, "[\"Standard\", \"Double Patty\"]" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111103"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "Rich double-shot espresso layered with steamed whole milk and topped with delicate micro-foam art.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80", 4.7m, "[\"Small\", \"Medium\", \"Large\"]" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111104"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "Light and fluffy ring donut dipped in a sweet sugar glaze that melts in your mouth.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&auto=format&fit=crop&q=80", 4.6m, "[\"Standard\"]" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111105"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "A meat lover's platter featuring grilled steak slices, lamb chop, chicken breast, and grilled vegetables served with a peppercorn sauce.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80", 4.9m, "[\"Standard\"]" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111106"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "Crispy golden french fries tossed in aromatic white truffle oil, salt, and freshly grated parmesan cheese, served with garlic aioli.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80", 4.8m, "[\"Standard\"]" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111107"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "Premium Japanese ceremonial Uji matcha whisked and poured over cold milk and ice.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80", 4.7m, "[\"Standard\"]" });

            migrationBuilder.UpdateData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111108"),
                columns: new[] { "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "Rating", "SizesJson" },
                values: new object[] { "[]", "USDA Prime Ribeye steak grilled to your liking, seasoned with sea salt and black pepper, served with a side of garlic butter.", 0m, 0m, "", "[\"https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80\"]", "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80", 4.9m, "[\"Standard\"]" });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "CategoryId", "Code", "ColorsJson", "Description", "DiscountAmount", "DiscountPercentage", "DressStyle", "GalleryJson", "ImageUrl", "IsActive", "IsVatInclusive", "MinStockThreshold", "Name", "Price", "Rating", "SizesJson", "StandardCost", "StockQuantity", "UpdatedAt", "Version" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111201"), new Guid("22222222-2222-2222-2222-222222222205"), "C001", "[{\"name\":\"Brown\",\"code\":\"bg-[#4F4631]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"},{\"name\":\"Green\",\"code\":\"bg-[#314F36]\"}]", "Minimalist cotton t-shirt featuring distinct contrast tape details along the shoulders and sleeves. Comfortable fit for everyday wear.", 0m, 0m, "Casual", "[\"/images/pic1.png\", \"/images/pic10.png\", \"/images/pic11.png\"]", "/images/pic1.png", true, true, 10, "T-shirt with Tape Details", 120.00m, 4.5m, "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]", 30.00m, 100, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111202"), new Guid("22222222-2222-2222-2222-222222222205"), "C002", "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"}]", "Classic denim skinny jeans with a bit of stretch for maximum comfort. Features a five-pocket design and zip fly with button closure.", 0m, 20m, "Casual", "[\"/images/pic2.png\"]", "/images/pic2.png", true, true, 5, "Skinny Fit Jeans", 260.00m, 3.5m, "[\"Small\", \"Medium\", \"Large\"]", 80.00m, 75, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111203"), new Guid("22222222-2222-2222-2222-222222222205"), "C003", "[{\"name\":\"Red\",\"code\":\"bg-[#ff0000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]", "Stylish long-sleeve checkered button-down shirt. Perfect for layering over a graphic tee or wearing on its own.", 0m, 0m, "Casual", "[\"/images/pic3.png\"]", "/images/pic3.png", true, true, 10, "Checkered Shirt", 180.00m, 4.5m, "[\"Medium\", \"Large\"]", 50.00m, 45, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111204"), new Guid("22222222-2222-2222-2222-222222222205"), "C004", "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]", "Breathable athletic-style crewneck t-shirt with signature dual stripes around the sleeves.", 0m, 30m, "Casual", "[\"/images/pic4.png\", \"/images/pic10.png\", \"/images/pic11.png\"]", "/images/pic4.png", true, true, 10, "Sleeve Striped T-shirt", 160.00m, 4.5m, "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]", 35.00m, 110, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111205"), new Guid("22222222-2222-2222-2222-222222222205"), "C005", "[{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"}]", "Breathable linen shirt with thin vertical stripes. Roll up the sleeves for a summer-ready casual resort look.", 0m, 20m, "Casual", "[\"/images/pic5.png\", \"/images/pic10.png\", \"/images/pic11.png\"]", "/images/pic5.png", true, true, 8, "Vertical Striped Shirt", 232.00m, 5.0m, "[\"Medium\", \"Large\", \"X-Large\"]", 70.00m, 30, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111206"), new Guid("22222222-2222-2222-2222-222222222205"), "C006", "[{\"name\":\"Orange\",\"code\":\"bg-[#ffa500]\"},{\"name\":\"Black\",\"code\":\"bg-[#000000]\"}]", "Premium heavyweight cotton t-shirt with a bold graphic print on the chest reading 'Courage'.", 0m, 0m, "Casual", "[\"/images/pic6.png\", \"/images/pic10.png\", \"/images/pic11.png\"]", "/images/pic6.png", true, true, 15, "Courage Graphic T-shirt", 145.00m, 4.0m, "[\"Small\", \"Medium\", \"Large\"]", 30.00m, 90, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111207"), new Guid("22222222-2222-2222-2222-222222222205"), "C007", "[{\"name\":\"Blue\",\"code\":\"bg-[#0000ff]\"},{\"name\":\"Brown\",\"code\":\"bg-[#a52a2a]\"}]", "Relaxed-fit shorts sitting just above the knee, crafted in durable twill cotton with comfortable wide leg openings.", 0m, 0m, "Casual", "[\"/images/pic7.png\"]", "/images/pic7.png", true, true, 10, "Loose Fit Bermuda Shorts", 80.00m, 3.0m, "[\"Small\", \"Medium\", \"Large\"]", 20.00m, 40, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111208"), new Guid("22222222-2222-2222-2222-222222222205"), "C008", "[{\"name\":\"Grey\",\"code\":\"bg-[#808080]\"},{\"name\":\"Blue\",\"code\":\"bg-[#31344F]\"}]", "Distressed skinny jeans with character-rich faded washes at the thighs and knees.", 0m, 0m, "Casual", "[\"/images/pic8.png\"]", "/images/pic8.png", true, true, 5, "Faded Skinny Jeans", 210.00m, 4.5m, "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]", 65.00m, 60, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111212"), new Guid("22222222-2222-2222-2222-222222222205"), "C012", "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]", "Classic pique polo shirt detailed with refined contrast piping on the collar and sleeve cuffs.", 0m, 20m, "Formal", "[\"/images/pic12.png\", \"/images/pic10.png\", \"/images/pic11.png\"]", "/images/pic12.png", true, true, 8, "Polo with Contrast Trims", 242.00m, 4.0m, "[\"Small\", \"Medium\", \"Large\"]", 75.00m, 35, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111213"), new Guid("22222222-2222-2222-2222-222222222205"), "C013", "[{\"name\":\"Pink\",\"code\":\"bg-[#ffc0cb]\"},{\"name\":\"Purple\",\"code\":\"bg-[#800080]\"}]", "Cotton crewneck styled with an eye-catching soft gradient color blend fading down the body.", 0m, 0m, "Gym", "[\"/images/pic13.png\", \"/images/pic10.png\", \"/images/pic11.png\"]", "/images/pic13.png", true, true, 15, "Gradient Graphic T-shirt", 145.00m, 3.5m, "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]", 30.00m, 85, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111214"), new Guid("22222222-2222-2222-2222-222222222205"), "C014", "[{\"name\":\"Green\",\"code\":\"bg-[#008000]\"},{\"name\":\"White\",\"code\":\"bg-[#ffffff]\"}]", "Slim-fit collared polo shirt featuring contrast colored tipping bands around the edges.", 0m, 0m, "Formal", "[\"/images/pic14.png\"]", "/images/pic14.png", true, true, 10, "Polo with Tipping Details", 180.00m, 4.5m, "[\"Small\", \"Medium\", \"Large\"]", 50.00m, 40, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 },
                    { new Guid("11111111-1111-1111-1111-111111111215"), new Guid("22222222-2222-2222-2222-222222222205"), "C015", "[{\"name\":\"Black\",\"code\":\"bg-[#000000]\"}]", "Classic black t-shirt printed with horizontal white stripes. Easy to dress up under a blazer or dress down with shorts.", 0m, 30m, "Casual", "[\"/images/pic15.png\"]", "/images/pic15.png", true, true, 12, "Black Striped T-shirt", 150.00m, 5.0m, "[\"Small\", \"Medium\", \"Large\", \"X-Large\"]", 35.00m, 95, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1 }
                });

            migrationBuilder.InsertData(
                table: "ProductReviews",
                columns: new[] { "Id", "Content", "CreatedAt", "CustomerName", "ProductId", "Rating" },
                values: new object[,]
                {
                    { new Guid("33333333-3333-3333-3333-333333333001"), "Finding clothes that align with my personal style used to be a challenge until I discovered this. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.", new DateTime(2023, 8, 14, 12, 0, 0, 0, DateTimeKind.Utc), "Alex K.", new Guid("11111111-1111-1111-1111-111111111201"), 5 },
                    { new Guid("33333333-3333-3333-3333-333333333002"), "I'm blown away by the quality and style of the clothes I received. Every piece I've bought has exceeded my expectations.", new DateTime(2023, 8, 15, 14, 30, 0, 0, DateTimeKind.Utc), "Sarah M.", new Guid("11111111-1111-1111-1111-111111111202"), 4 },
                    { new Guid("33333333-3333-3333-3333-333333333003"), "This shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect.", new DateTime(2023, 8, 16, 9, 15, 0, 0, DateTimeKind.Utc), "Ethan R.", new Guid("11111111-1111-1111-1111-111111111203"), 5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_ProductId",
                table: "ProductReviews",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductReviews");

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111201"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111202"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111203"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111204"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111205"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111206"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111207"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111208"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111212"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111213"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111214"));

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111215"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222205"));

            migrationBuilder.DropColumn(
                name: "ColorsJson",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "DiscountPercentage",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "DressStyle",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "GalleryJson",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SizesJson",
                table: "Products");
        }
    }
}
