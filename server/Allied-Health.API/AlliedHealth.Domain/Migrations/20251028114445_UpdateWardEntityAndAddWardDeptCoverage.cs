using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWardEntityAndAddWardDeptCoverage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BedCount",
                table: "Ward",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Ward",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedBy",
                table: "Ward",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Ward",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "DefaultDepartmentId",
                table: "Ward",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Ward",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Hidden",
                table: "Ward",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Ward",
                type: "character varying(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "ModifiedBy",
                table: "Ward",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ModifiedDate",
                table: "Ward",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WardDepartmentCoverage",
                columns: table => new
                {
                    WardId = table.Column<Guid>(type: "uuid", nullable: false),
                    DepartmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WardDepartmentCoverage", x => new { x.WardId, x.DepartmentId });
                    table.ForeignKey(
                        name: "FK_WardDepartmentCoverage_Department_DepartmentId",
                        column: x => x.DepartmentId,
                        principalTable: "Department",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WardDepartmentCoverage_Ward_WardId",
                        column: x => x.WardId,
                        principalTable: "Ward",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ward_Code",
                table: "Ward",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ward_DefaultDepartmentId",
                table: "Ward",
                column: "DefaultDepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_WardDepartmentCoverage_DepartmentId",
                table: "WardDepartmentCoverage",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ward_Department_DefaultDepartmentId",
                table: "Ward",
                column: "DefaultDepartmentId",
                principalTable: "Department",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ward_Department_DefaultDepartmentId",
                table: "Ward");

            migrationBuilder.DropTable(
                name: "WardDepartmentCoverage");

            migrationBuilder.DropIndex(
                name: "IX_Ward_Code",
                table: "Ward");

            migrationBuilder.DropIndex(
                name: "IX_Ward_DefaultDepartmentId",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "BedCount",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "DefaultDepartmentId",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "Hidden",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "ModifiedBy",
                table: "Ward");

            migrationBuilder.DropColumn(
                name: "ModifiedDate",
                table: "Ward");
        }
    }
}
