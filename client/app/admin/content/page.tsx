"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash } from "lucide-react";

export default function ContentManagementPage() {
  const articles = [
    {
      id: 1,
      title: "Understanding Diabetes: Types, Symptoms, and Management",
      category: "Education",
      author: "Dr. Jane Smith",
      status: "Published",
      date: "2023-06-10",
    },
    {
      id: 2,
      title: "10 Low-GI Recipes for Diabetic-Friendly Meals",
      category: "Recipes",
      author: "Chef Michael Brown",
      status: "Published",
      date: "2023-06-05",
    },
    {
      id: 3,
      title: "Exercise and Blood Sugar: Finding the Right Balance",
      category: "Fitness",
      author: "Sarah Johnson, PT",
      status: "Draft",
      date: "2023-06-15",
    },
    {
      id: 4,
      title: "Latest Research in Diabetes Treatment",
      category: "Research",
      author: "Dr. Robert Chen",
      status: "Review",
      date: "2023-06-12",
    },
    {
      id: 5,
      title: "Managing Diabetes During Holidays",
      category: "Lifestyle",
      author: "Lisa Thompson, RD",
      status: "Published",
      date: "2023-05-28",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Article
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Articles</CardTitle>
          <CardDescription>Manage your blog articles and resources</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        article.status === "Published"
                          ? "bg-green-100 text-green-800"
                          : article.status === "Draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {article.status}
                    </span>
                  </TableCell>
                  <TableCell>{article.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 

