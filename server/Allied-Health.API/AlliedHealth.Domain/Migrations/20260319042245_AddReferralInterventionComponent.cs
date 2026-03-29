using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddReferralInterventionComponent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReferralInterventionComponent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferralInterventionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentTypeId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralInterventionComponent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReferralInterventionComponent_ComponentType_ComponentTypeId",
                        column: x => x.ComponentTypeId,
                        principalTable: "ComponentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReferralInterventionComponent_ReferralIntervention_Referral~",
                        column: x => x.ReferralInterventionId,
                        principalTable: "ReferralIntervention",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReferralInterventionComponent_ComponentTypeId",
                table: "ReferralInterventionComponent",
                column: "ComponentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_ReferralInterventionComponent_ReferralInterventionId",
                table: "ReferralInterventionComponent",
                column: "ReferralInterventionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReferralInterventionComponent");
        }
    }
}
