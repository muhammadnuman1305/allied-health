using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddComponentTypeAndInterventionComponent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ComponentType",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ComponentType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "InterventionComponent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InterventionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentTypeId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InterventionComponent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterventionComponent_ComponentType_ComponentTypeId",
                        column: x => x.ComponentTypeId,
                        principalTable: "ComponentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterventionComponent_Intervention_InterventionId",
                        column: x => x.InterventionId,
                        principalTable: "Intervention",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "ComponentType",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Technique" },
                    { 2, "Activity" },
                    { 3, "Equipment" },
                    { 4, "Education" },
                    { 5, "Environment" },
                    { 6, "AssistanceLevel" },
                    { 7, "Safety" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ComponentType_Name",
                table: "ComponentType",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterventionComponent_ComponentTypeId",
                table: "InterventionComponent",
                column: "ComponentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_InterventionComponent_InterventionId",
                table: "InterventionComponent",
                column: "InterventionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InterventionComponent");

            migrationBuilder.DropTable(
                name: "ComponentType");
        }
    }
}
