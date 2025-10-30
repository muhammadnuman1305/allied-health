using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWardDeptCoverage2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WardDepartmentCoverage_Department_DepartmentId",
                table: "WardDepartmentCoverage");

            migrationBuilder.DropForeignKey(
                name: "FK_WardDepartmentCoverage_Ward_WardId",
                table: "WardDepartmentCoverage");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WardDepartmentCoverage",
                table: "WardDepartmentCoverage");

            migrationBuilder.RenameTable(
                name: "WardDepartmentCoverage",
                newName: "WardDeptCoverage");

            migrationBuilder.RenameIndex(
                name: "IX_WardDepartmentCoverage_DepartmentId",
                table: "WardDeptCoverage",
                newName: "IX_WardDeptCoverage_DepartmentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WardDeptCoverage",
                table: "WardDeptCoverage",
                columns: new[] { "WardId", "DepartmentId" });

            migrationBuilder.AddForeignKey(
                name: "FK_WardDeptCoverage_Department_DepartmentId",
                table: "WardDeptCoverage",
                column: "DepartmentId",
                principalTable: "Department",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WardDeptCoverage_Ward_WardId",
                table: "WardDeptCoverage",
                column: "WardId",
                principalTable: "Ward",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WardDeptCoverage_Department_DepartmentId",
                table: "WardDeptCoverage");

            migrationBuilder.DropForeignKey(
                name: "FK_WardDeptCoverage_Ward_WardId",
                table: "WardDeptCoverage");

            migrationBuilder.DropPrimaryKey(
                name: "PK_WardDeptCoverage",
                table: "WardDeptCoverage");

            migrationBuilder.RenameTable(
                name: "WardDeptCoverage",
                newName: "WardDepartmentCoverage");

            migrationBuilder.RenameIndex(
                name: "IX_WardDeptCoverage_DepartmentId",
                table: "WardDepartmentCoverage",
                newName: "IX_WardDepartmentCoverage_DepartmentId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_WardDepartmentCoverage",
                table: "WardDepartmentCoverage",
                columns: new[] { "WardId", "DepartmentId" });

            migrationBuilder.AddForeignKey(
                name: "FK_WardDepartmentCoverage_Department_DepartmentId",
                table: "WardDepartmentCoverage",
                column: "DepartmentId",
                principalTable: "Department",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WardDepartmentCoverage_Ward_WardId",
                table: "WardDepartmentCoverage",
                column: "WardId",
                principalTable: "Ward",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
