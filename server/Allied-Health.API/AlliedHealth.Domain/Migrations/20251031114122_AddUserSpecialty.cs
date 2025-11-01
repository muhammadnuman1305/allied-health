using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSpecialty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AhaRoleCategory");

            migrationBuilder.DropTable(
                name: "AhaRole");

            migrationBuilder.CreateTable(
                name: "UserSpecialty",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpecialtyId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "(now() at time zone 'utc')")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSpecialty", x => new { x.UserId, x.SpecialtyId });
                    table.ForeignKey(
                        name: "FK_UserSpecialty_Specialty_SpecialtyId",
                        column: x => x.SpecialtyId,
                        principalTable: "Specialty",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserSpecialty_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSpecialty_SpecialtyId",
                table: "UserSpecialty",
                column: "SpecialtyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSpecialty");

            migrationBuilder.CreateTable(
                name: "AhaRole",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AhaRole", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AhaRoleCategory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AhaRoleCategory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AhaRoleCategory_AhaRole_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AhaRole",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AhaRole_Name",
                table: "AhaRole",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AhaRoleCategory_RoleId_Name",
                table: "AhaRoleCategory",
                columns: new[] { "RoleId", "Name" },
                unique: true);
        }
    }
}
