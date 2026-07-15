using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class database : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ForumComments_ForumPosts_ForumPostId",
                table: "ForumComments");

            migrationBuilder.DropForeignKey(
                name: "FK_ForumComments_Users_UserId",
                table: "ForumComments");

            migrationBuilder.DropIndex(
                name: "IX_ForumComments_ForumPostId",
                table: "ForumComments");

            migrationBuilder.DropIndex(
                name: "IX_ForumComments_UserId",
                table: "ForumComments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ForumComments_ForumPostId",
                table: "ForumComments",
                column: "ForumPostId");

            migrationBuilder.CreateIndex(
                name: "IX_ForumComments_UserId",
                table: "ForumComments",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ForumComments_ForumPosts_ForumPostId",
                table: "ForumComments",
                column: "ForumPostId",
                principalTable: "ForumPosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ForumComments_Users_UserId",
                table: "ForumComments",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "ID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
