using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTaskInterventionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Task_Department_DepartmentId",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "CustomType",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Task");

            migrationBuilder.RenameColumn(
                name: "DueDate",
                table: "Task",
                newName: "StartDate");

            migrationBuilder.AddColumn<Guid>(
                name: "AhaId",
                table: "TaskIntervention",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateOnly>(
                name: "EndDate",
                table: "TaskIntervention",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<DateOnly>(
                name: "StartDate",
                table: "TaskIntervention",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<Guid>(
                name: "WardId",
                table: "TaskIntervention",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateOnly>(
                name: "EndDate",
                table: "Task",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddForeignKey(
                name: "FK_Task_Department_DepartmentId",
                table: "Task",
                column: "DepartmentId",
                principalTable: "Department",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Task_Department_DepartmentId",
                table: "Task");

            migrationBuilder.DropColumn(
                name: "AhaId",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "WardId",
                table: "TaskIntervention");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "Task");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "Task",
                newName: "DueDate");

            migrationBuilder.AddColumn<string>(
                name: "CustomType",
                table: "Task",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Task",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "FK_Task_Department_DepartmentId",
                table: "Task",
                column: "DepartmentId",
                principalTable: "Department",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
