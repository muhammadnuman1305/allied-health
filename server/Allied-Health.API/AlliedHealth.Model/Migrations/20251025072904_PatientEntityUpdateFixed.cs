using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AlliedHealth.Domain.Migrations
{
    /// <inheritdoc />
    public partial class PatientEntityUpdateFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Patient_Priority_PriorityId",
                table: "Patient");

            migrationBuilder.DropForeignKey(
                name: "FK_Patient_User_ReferringAHP",
                table: "Patient");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientOutcome_Patient_PatientId",
                table: "PatientOutcome");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Patient",
                table: "Patient");

            migrationBuilder.DropIndex(
                name: "IX_Patient_LastName_FirstName",
                table: "Patient");

            migrationBuilder.DropIndex(
                name: "IX_Patient_ReferringAHP",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "UMRN",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "BedNumber",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "Diagnosis",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "Goal",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "Hidden",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "ReferralDate",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "ReferringAHP",
                table: "Patient");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Patient",
                newName: "FullName");

            migrationBuilder.AlterColumn<int>(
                name: "PatientId",
                table: "PatientOutcome",
                type: "integer",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastModifiedDate",
                table: "Patient",
                type: "timestamp with time zone",
                nullable: true,
                defaultValueSql: "timezone('utc', now())",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Gender",
                table: "Patient",
                type: "integer",
                nullable: false,
                oldClrType: typeof(char),
                oldType: "character(1)");

            migrationBuilder.AddColumn<int>(
                name: "MRN",
                table: "Patient",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactName",
                table: "Patient",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactPhone",
                table: "Patient",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryPhone",
                table: "Patient",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Patient",
                table: "Patient",
                column: "MRN");

            migrationBuilder.AddForeignKey(
                name: "FK_Patient_Priority_PriorityId",
                table: "Patient",
                column: "PriorityId",
                principalTable: "Priority",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PatientOutcome_Patient_PatientId",
                table: "PatientOutcome",
                column: "PatientId",
                principalTable: "Patient",
                principalColumn: "MRN",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Patient_Priority_PriorityId",
                table: "Patient");

            migrationBuilder.DropForeignKey(
                name: "FK_PatientOutcome_Patient_PatientId",
                table: "PatientOutcome");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Patient",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "MRN",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "EmergencyContactName",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "EmergencyContactPhone",
                table: "Patient");

            migrationBuilder.DropColumn(
                name: "PrimaryPhone",
                table: "Patient");

            migrationBuilder.RenameColumn(
                name: "FullName",
                table: "Patient",
                newName: "LastName");

            migrationBuilder.AlterColumn<Guid>(
                name: "PatientId",
                table: "PatientOutcome",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastModifiedDate",
                table: "Patient",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true,
                oldDefaultValueSql: "timezone('utc', now())");

            migrationBuilder.AlterColumn<char>(
                name: "Gender",
                table: "Patient",
                type: "character(1)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<Guid>(
                name: "UMRN",
                table: "Patient",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "BedNumber",
                table: "Patient",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Diagnosis",
                table: "Patient",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Patient",
                type: "character varying(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Goal",
                table: "Patient",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Hidden",
                table: "Patient",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Patient",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReferralDate",
                table: "Patient",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ReferringAHP",
                table: "Patient",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Patient",
                table: "Patient",
                column: "UMRN");

            migrationBuilder.CreateIndex(
                name: "IX_Patient_LastName_FirstName",
                table: "Patient",
                columns: new[] { "LastName", "FirstName" });

            migrationBuilder.CreateIndex(
                name: "IX_Patient_ReferringAHP",
                table: "Patient",
                column: "ReferringAHP");

            migrationBuilder.AddForeignKey(
                name: "FK_Patient_Priority_PriorityId",
                table: "Patient",
                column: "PriorityId",
                principalTable: "Priority",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Patient_User_ReferringAHP",
                table: "Patient",
                column: "ReferringAHP",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_PatientOutcome_Patient_PatientId",
                table: "PatientOutcome",
                column: "PatientId",
                principalTable: "Patient",
                principalColumn: "UMRN",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
