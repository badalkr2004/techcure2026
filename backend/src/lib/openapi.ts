import { OpenAPIRegistry, OpenApiGeneratorV3 } from "zod-to-openapi";
import * as schemas from "./schemas";

const registry = new OpenAPIRegistry();

registry.register("PanicRequest", schemas.PanicSchema);
registry.register("CreateIssue", schemas.CreateIssueSchema);
registry.register(
  "CreateVolunteerProfile",
  schemas.CreateVolunteerProfileSchema
);
registry.register("CreateTeam", schemas.CreateTeamSchema);
registry.register("CreateDisaster", schemas.CreateDisasterSchema);
registry.register("CreateCampaign", schemas.CreateCampaignSchema);
registry.register("CreateDonation", schemas.CreateDonationSchema);

registry.registerPath({
  method: "post",
  path: "/api/panic",
  summary: "Create a panic alert",
  tags: ["Panic"],
  request: {
    body: {
      content: {
        "application/json": { schema: schemas.PanicSchema },
      },
    },
  },
  responses: {
    201: { description: "Panic alert created" },
    400: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/issues",
  summary: "Report an issue",
  tags: ["Issues"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: schemas.CreateIssueSchema },
      },
    },
  },
  responses: {
    201: { description: "Issue created" },
    400: { description: "Validation error" },
    401: { description: "Authentication required" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/donations",
  summary: "Make a donation",
  tags: ["Donations"],
  request: {
    body: {
      content: {
        "application/json": { schema: schemas.CreateDonationSchema },
      },
    },
  },
  responses: {
    201: { description: "Donation successful" },
    400: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/campaigns",
  summary: "Create a campaign",
  tags: ["Campaigns"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: schemas.CreateCampaignSchema },
      },
    },
  },
  responses: {
    201: { description: "Campaign created" },
    401: { description: "Authentication required" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/volunteer/profile",
  summary: "Create volunteer profile",
  tags: ["Volunteer"],
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: schemas.CreateVolunteerProfileSchema },
      },
    },
  },
  responses: {
    201: { description: "Profile created" },
    401: { description: "Authentication required" },
  },
});

export function generateOpenAPISpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Bihar Sahayata API",
      version: "1.0.0",
      description:
        "Disaster relief and volunteer coordination platform for Bihar",
      contact: {
        name: "Bihar Sahayata",
        email: "admin@biharsahayata.in",
      },
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development" },
      { url: "https://api.biharsahayata.in", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Token from /api/auth/sign-in/email (required for React Native)",
        },
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Session cookie (used automatically by web browsers)",
        },
      },
    },
  });
}
