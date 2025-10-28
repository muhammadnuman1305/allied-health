using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDepartmentTable4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Department_Specialty_SpecialtyId",
                table: "Department");

            migrationBuilder.DropIndex(
                name: "IX_Department_SpecialtyId",
                table: "Department");

            migrationBuilder.DropColumn(
                name: "SpecialtyId",
                table: "Department");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SpecialtyId",
                table: "Department",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Department_SpecialtyId",
                table: "Department",
                column: "SpecialtyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Department_Specialty_SpecialtyId",
                table: "Department",
                column: "SpecialtyId",
                principalTable: "Specialty",
                principalColumn: "SpecialtyId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
