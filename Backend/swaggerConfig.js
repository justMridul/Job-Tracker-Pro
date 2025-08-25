// swaggerConfig.js
"use strict";

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Internship and Job Tracker API",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for the Internship and Job Tracker backend",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        // Shared error schema for consistent error responses
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Validation error" },
            details: { type: "object" },
          },
        },

        // ===== Users =====
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            profile: {
              type: "object",
              properties: {
                bio: { type: "string", example: "Full-stack developer" },
                skills: {
                  type: "array",
                  items: { type: "string" },
                  example: ["React", "Node.js"],
                },
                linkedin: {
                  type: "string",
                  example: "https://www.linkedin.com/in/johndoe",
                },
                github: {
                  type: "string",
                  example: "https://github.com/johndoe",
                },
                resumeUrl: {
                  type: "string",
                  example: "https://cdn.example.com/resumes/john.pdf",
                },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UserUpdate: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            profile: {
              type: "object",
              properties: {
                bio: { type: "string" },
                skills: { type: "array", items: { type: "string" } },
                linkedin: { type: "string" },
                github: { type: "string" },
                resumeUrl: { type: "string" },
              },
            },
          },
        },

        // ===== Jobs =====
        Job: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string", example: "Software Engineer" },
            company: { type: "string", example: "Google" },
            location: { type: "string", example: "Remote" },
            description: {
              type: "string",
              example: "Build and ship web applications.",
            },
            requirements: {
              type: "array",
              items: { type: "string" },
              example: ["3+ years JS", "Node.js", "MongoDB"],
            },
            postedBy: { type: "string", description: "User ID" },
            salaryRange: {
              type: "object",
              properties: {
                min: { type: "number", example: 80000 },
                max: { type: "number", example: 120000 },
              },
            },
            jobType: {
              type: "string",
              enum: ["full-time", "part-time", "internship", "remote"],
              example: "full-time",
            },
            status: {
              type: "string",
              enum: ["open", "closed"],
              example: "open",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        JobCreate: {
          type: "object",
          required: ["title", "company"],
          properties: {
            title: { type: "string", example: "Software Engineer" },
            company: { type: "string", example: "Google" },
            location: { type: "string", example: "Remote" },
            description: { type: "string" },
            requirements: { type: "array", items: { type: "string" } },
            // postedBy is inferred from auth; omit from public contract
            salaryRange: {
              type: "object",
              properties: {
                min: { type: "number", example: 80000 },
                max: { type: "number", example: 120000 },
              },
            },
            jobType: {
              type: "string",
              enum: ["full-time", "part-time", "internship", "remote"],
              example: "full-time",
            },
            status: { type: "string", enum: ["open", "closed"], example: "open" },
          },
        },
        JobUpdate: {
          type: "object",
          properties: {
            title: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
            requirements: { type: "array", items: { type: "string" } },
            salaryRange: {
              type: "object",
              properties: {
                min: { type: "number" },
                max: { type: "number" },
              },
            },
            jobType: {
              type: "string",
              enum: ["full-time", "part-time", "internship", "remote"],
            },
            status: { type: "string", enum: ["open", "closed"] },
          },
        },

        // ===== Internships =====
        Internship: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string", example: "Frontend Intern" },
            company: { type: "string", example: "Startup Inc." },
            location: { type: "string", example: "Hybrid - Bangalore" },
            description: {
              type: "string",
              example: "Assist in building UI components.",
            },
            eligibility: {
              type: "array",
              items: { type: "string" },
              example: ["B.Tech 3rd year", "React basics"],
            },
            duration: { type: "string", example: "3 months" },
            stipend: { type: "number", example: 20000 },
            postedBy: { type: "string" },
            status: { type: "string", enum: ["open", "closed"], example: "open" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        InternshipCreate: {
          type: "object",
          required: ["title", "company"],
          properties: {
            title: { type: "string", example: "Frontend Intern" },
            company: { type: "string", example: "Startup Inc." },
            location: { type: "string", example: "Hybrid - Bangalore" },
            description: { type: "string" },
            eligibility: { type: "array", items: { type: "string" } },
            duration: { type: "string", example: "3 months" },
            stipend: { type: "number", example: 20000 },
            postedBy: { type: "string" },
            status: { type: "string", enum: ["open", "closed"], example: "open" },
          },
        },
        InternshipUpdate: {
          type: "object",
          properties: {
            title: { type: "string" },
            company: { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
            eligibility: { type: "array", items: { type: "string" } },
            duration: { type: "string" },
            stipend: { type: "number" },
            status: { type: "string", enum: ["open", "closed"] },
          },
        },

        // ===== Applications =====
        Application: {
          type: "object",
          properties: {
            _id: { type: "string" },
            candidate: { type: "string", description: "User ID" },
            job: { type: "string", nullable: true, description: "Job ID" },
            internship: {
              type: "string",
              nullable: true,
              description: "Internship ID",
            },
            coverLetter: { type: "string" },
            resumeUrl: { type: "string" },
            status: {
              type: "string",
              enum: ["applied", "in-review", "interview", "accepted", "rejected"],
              example: "applied",
            },
            appliedAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ApplicationCreate: {
          type: "object",
          required: ["candidate"],
          properties: {
            candidate: { type: "string", description: "User ID" },
            job: { type: "string", nullable: true, description: "Job ID" },
            internship: {
              type: "string",
              nullable: true,
              description: "Internship ID",
            },
            coverLetter: { type: "string" },
            resumeUrl: { type: "string" },
          },
        },
        ApplicationStatusUpdate: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["applied", "in-review", "interview", "accepted", "rejected"],
              example: "in-review",
            },
          },
        },

        // ===== Settings =====
        Settings: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string", example: "johndoe" },
            darkMode: { type: "boolean", example: false },
            emailNotifications: { type: "boolean", example: true },
            notificationsFrequency: {
              type: "string",
              enum: ["immediately", "daily", "weekly", "never"],
              example: "daily",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        SettingsUpdate: {
          type: "object",
          properties: {
            darkMode: { type: "boolean" },
            emailNotifications: { type: "boolean" },
            notificationsFrequency: {
              type: "string",
              enum: ["immediately", "daily", "weekly", "never"],
            },
          },
        },
      },
    },
    // Global security requirement (JWT)
    security: [{ bearerAuth: [] }],
  },
  // Route files to scan for annotations
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
