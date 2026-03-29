using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskInterventionComponent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TaskInterventionComponent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskInterventionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentTypeId = table.Column<int>(type: "integer", nullable: false),
                    Value = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskInterventionComponent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskInterventionComponent_ComponentType_ComponentTypeId",
                        column: x => x.ComponentTypeId,
                        principalTable: "ComponentType",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaskInterventionComponent_TaskIntervention_TaskIntervention~",
                        column: x => x.TaskInterventionId,
                        principalTable: "TaskIntervention",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskInterventionComponent_ComponentTypeId",
                table: "TaskInterventionComponent",
                column: "ComponentTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskInterventionComponent_TaskInterventionId",
                table: "TaskInterventionComponent",
                column: "TaskInterventionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskInterventionComponent");
        }
    }
}
