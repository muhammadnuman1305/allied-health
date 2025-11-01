using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTaskInterventions3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskIntervention_Intervention_InterventionId",
                table: "TaskIntervention");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskIntervention",
                table: "TaskIntervention");

            migrationBuilder.AddColumn<Guid>(
                name: "Id",
                table: "TaskIntervention",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskIntervention",
                table: "TaskIntervention",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_TaskIntervention_TaskId",
                table: "TaskIntervention",
                column: "TaskId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskIntervention_Intervention_InterventionId",
                table: "TaskIntervention",
                column: "InterventionId",
                principalTable: "Intervention",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskIntervention_Intervention_InterventionId",
                table: "TaskIntervention");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskIntervention",
                table: "TaskIntervention");

            migrationBuilder.DropIndex(
                name: "IX_TaskIntervention_TaskId",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "TaskIntervention");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskIntervention",
                table: "TaskIntervention",
                columns: new[] { "TaskId", "InterventionId" });

            migrationBuilder.AddForeignKey(
                name: "FK_TaskIntervention_Intervention_InterventionId",
                table: "TaskIntervention",
                column: "InterventionId",
                principalTable: "Intervention",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
