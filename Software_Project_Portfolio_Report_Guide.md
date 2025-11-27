# Software Project Portfolio Report Guide
## Vehicle Management System Project

### Team Members Section

Fill in your team member names and student ID numbers. Remove extra team member slots if you have fewer than 5 members.

---

### Declaration of Originality

Each team member must sign this section confirming the work is their own.

---

## Section 1: Software Project Leadership and Entrepreneurship (Group Evaluation)

### 1.1 Agile Approach to Project Management and Leadership

**What to Include:**

- Describe your agile methodology choice. Scrum, Kanban, or hybrid.
- Document sprint planning sessions with screenshots from your project management tool.
- Show your backlog management process.
- List risk management strategies you implemented.
- Address social considerations: how the system impacts users and stakeholders.
- Address legal considerations: data privacy, GDPR compliance if applicable, terms of service.
- Address ethical considerations: fair access, preventing discrimination, transparent data usage.

**Team Member Contributions:**

List each member's specific contributions:
- Team Member 1: Sprint planning, risk assessment documentation
- Team Member 2: Legal compliance research, GDPR documentation
- Team Member 3: Ethical guidelines development
- Team Member 4: Stakeholder communication
- Team Member 5: Social impact analysis

**Evidence to Provide:**

- Screenshots of Jira, Trello, or GitHub project boards
- Sprint retrospective notes
- Risk register documents
- Meeting notes showing agile ceremonies

---

### 1.2 Software Artefacts

#### 1.2.1 Design

**What to Include:**

- Entity Relationship Diagram showing database structure
- System architecture diagram showing frontend apps, backend API, database connections
- User flow diagrams for each role (Admin, Driver, Mechanic, Finance)
- API endpoint documentation with request/response examples
- Database schema showing tables: Users, Vehicles, Trips, Maintenance, Issues, Parts, Inspections

**Evidence to Provide:**

- ERD screenshot from your design tool
- Architecture diagram showing microservices or monolith structure
- Wireframes or mockups of key user interfaces
- API documentation screenshots from Swagger or Postman

**Key Design Decisions to Document:**

- Why separate frontend apps for each role
- UUID implementation for IDs across the system
- Normalization layer in API clients
- Middleware-based role authorization
- Token-based authentication flow

---

#### 1.2.2 Implementation

**What to Include:**

- Show source code examples with annotations explaining key functions
- Document the technology stack: .NET 8, Next.js 16, MySQL, TypeScript
- Explain the API normalization approach
- Show role-based access control implementation
- Document the deployment process

**Code Examples to Include:**

**Backend API Controller Example:**
```csharp
// VehiclesController.cs
// This controller handles vehicle CRUD operations
// Uses dependency injection for VehicleService
// Implements JWT token-based authorization
// All endpoints require authentication
[ApiController]
[Route("api/[controller]")]
[Authorize] // Requires valid JWT token
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicleService;

    public VehiclesController(IVehicleService vehicleService)
    {
        _vehicleService = vehicleService;
        // Service injected via DI container in Program.cs
    }

    [HttpGet]
    public async Task<ActionResult<List<VehicleDTO>>> GetAllVehicles()
    {
        // Retrieves all vehicles from database
        // Includes related driver information
        // Returns normalized DTO objects
        var vehicles = await _vehicleService.GetAllVehiclesAsync();
        return Ok(vehicles);
    }
}
```

**Frontend API Client Example:**
```typescript
// lib/api.ts
// Normalizes backend responses to frontend format
// Handles UUID conversion from backend to frontend
// Maps field name variations (vehicleID vs vehicleId)

const normalizeVehicle = (vehicle: any) => {
  // Converts backend UUIDs to strings
  // Maps camelCase to consistent frontend format
  // Handles missing or null values gracefully
  return {
    id: normalizeId(vehicle.id ?? vehicle.vehicleID),
    vehicleID: normalizeId(vehicle.vehicleID),
    mileage: vehicle.mileage ?? vehicle.currentMileage ?? 0,
    // Maps all backend field variations to frontend standard
  };
};
```

**Middleware Example:**
```typescript
// middleware.ts
// Protects routes based on user role from JWT token
// Redirects unauthorized users to login
// Validates token before allowing access

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  // Extracts JWT token from cookies
  // Decodes token to check user role
  // Allows or denies access based on role match
}
```

**10-Minute Demo Video Requirements:**

- Show login process for each role
- Demonstrate key features: vehicle management, trip logging, maintenance scheduling, inventory management, cost reporting
- Use live data from your deployed backend
- Each team member should speak about their contributions
- Each member should reflect on their leadership style and entrepreneurial characteristics

**Video Structure:**

1. Introduction (1 minute): Team members introduce themselves
2. System Overview (2 minutes): Show architecture and deployment
3. Role Demonstrations (5 minutes):
   - Admin: Vehicle management, user assignment
   - Driver: Trip logging, issue reporting
   - Mechanic: Work orders, inventory management
   - Finance: Cost analysis, reporting
4. Team Reflections (2 minutes): Each member discusses leadership and entrepreneurship

---

#### 1.2.3 Testing

**What to Include:**

- Usability testing results with real users
- Test cases for each major feature
- Bug reports and resolutions
- Performance testing results
- Security testing outcomes

**Test Cases to Document:**

**Authentication Testing:**
- Test Case 1: Admin login redirects to admin dashboard
- Test Case 2: Driver login redirects to driver dashboard
- Test Case 3: Invalid credentials show error message
- Test Case 4: Expired token redirects to login

**Vehicle Management Testing:**
- Test Case 1: Create vehicle with valid data succeeds
- Test Case 2: Create vehicle with missing required fields fails
- Test Case 3: Update vehicle mileage updates correctly
- Test Case 4: Assign driver to vehicle updates assignment

**Trip Management Testing:**
- Test Case 1: Driver can start a trip
- Test Case 2: Driver can end a trip with mileage and fuel
- Test Case 3: Trip history displays correctly
- Test Case 4: Calculate fuel efficiency from trip data

**Evidence to Provide:**

- Screenshots of test execution results
- Usability testing feedback forms
- Performance metrics: page load times, API response times
- Security test results: authentication bypass attempts, SQL injection tests

---

## Section 2: Software Project Leadership and Entrepreneurship (Individual Evaluation)

### 2.1 Principles and Practice of Leadership and People Development

Each team member completes their own section. Word count: 1,750 words excluding Appendix A.

#### 2.1.1 The Influence of Leadership, Culture and Development on Performance

**What to Address:**

- How leadership style affected team productivity
- Impact of team culture on code quality and delivery speed
- How skill development sessions improved project outcomes
- Connection between leadership approach and sprint velocity

**Example Points:**

- Transformational leadership increased team engagement
- Collaborative culture reduced code review time
- Pair programming sessions improved code quality
- Regular retrospectives identified process improvements

---

#### 2.1.2 The Strategies Which Promote Engagement and Wellbeing as an Enabler of Individual and Team Performance

**What to Address:**

- Strategies you implemented to keep team engaged
- How you addressed team member wellbeing
- Connection between engagement and project success
- Methods for maintaining work-life balance during development

**Example Strategies:**

- Regular stand-up meetings for transparency
- Recognition of individual contributions
- Flexible working hours when possible
- Clear communication channels
- Conflict resolution processes

---

#### 2.1.3 The Leadership Development Strategy Which Values People Whilst Optimising Team and Organisational Success

**What to Address:**

- Your proposed leadership development strategy
- How it balances individual growth with team goals
- Implementation plan with measurable outcomes
- How it addresses both current and future needs

**Include in Appendix A:**

Your full leadership development strategy proposal. This should be a detailed document outlining your approach to developing leaders who value people and achieve organizational goals.

---

### 2.2 Theoretical Concepts and Entrepreneurial Practice

Each team member completes their own section. Word count: 1,750 words excluding Appendix B.

**Focus Areas for Each Member:**

To avoid repetition, assign different focus areas:
- Member 1: Market analysis and opportunity identification
- Member 2: Business model and revenue streams
- Member 3: Risk management and mitigation strategies
- Member 4: Innovation and competitive advantage
- Member 5: Scaling and growth strategies

#### 2.2.1 The Multi-Dimensional Issues Which Impact on Entrepreneurial Practice

**What to Address:**

- Technical challenges: API integration, state management, deployment
- Market challenges: competition, user adoption, pricing
- Resource challenges: time constraints, budget limitations, skill gaps
- Regulatory challenges: data protection, industry compliance

**Connect to Your VMS Project:**

- How separate frontend apps created deployment complexity
- Managing multiple codebases increased maintenance overhead
- Ensuring consistency across role-specific interfaces
- Balancing feature development with code quality

---

#### 2.2.2 Suggestion of Ways of Overcoming Barriers to Entrepreneurial Practice

**What to Address:**

- Evidence-based solutions for identified barriers
- Action plan with specific steps
- Resource requirements for implementation
- Expected outcomes and success metrics

**Include in Appendix B:**

Your proposal for a course of action to achieve an entrepreneurial aim. This should detail how you would overcome specific barriers you identified.

**Example Solutions:**

- Use component libraries to reduce development time
- Implement automated testing to catch bugs early
- Use CI/CD pipelines to streamline deployment
- Create reusable API normalization utilities
- Establish coding standards and code review processes

---

#### 2.2.3 Characteristics and Attributes of Entrepreneurial Leadership for Achieving Outcomes

**What to Address:**

- Key entrepreneurial leadership traits you demonstrated
- How these traits contributed to project success
- Examples of entrepreneurial decisions you made
- Impact of these decisions on project outcomes

**Example Characteristics:**

- Risk-taking: Deciding to use separate frontend apps
- Innovation: Implementing UUID normalization layer
- Adaptability: Adjusting architecture based on feedback
- Vision: Planning for future scalability
- Resilience: Overcoming deployment challenges

---

## Conclusion

Summarize the key achievements of your project. Highlight the leadership and entrepreneurial aspects that contributed to success. Reflect on lessons learned and areas for improvement.

---

## Appendices

### Appendix A: Leadership Development Strategy Proposals

Each team member includes their full strategy proposal here. This is excluded from word count.

### Appendix B: Course of Action Proposals

Each team member includes their action plan for overcoming entrepreneurial barriers. This is excluded from word count.

---

## References

Use CU APA referencing style. Include citations for:
- Agile methodology sources
- Leadership theory sources
- Entrepreneurship theory sources
- Technical documentation references
- Industry best practices

---

## Word Count Guidance

- Section 1 (Group): No specific limit, but be comprehensive
- Section 2.1 (Individual): 1,750 words per member (excluding Appendix A)
- Section 2.2 (Individual): 1,750 words per member (excluding Appendix B)
- Total per member: 3,500 words
- Overall report: Depends on team size, but do not exceed 5,500 words total (excluding appendices and references)

---

## Project-Specific Content Recommendations

**For Your VMS Project, Focus On:**

**Agile Evidence:**
- Sprint planning for implementing four separate frontend apps
- Daily standups to coordinate API integration
- Retrospectives after completing each role-specific app

**Design Evidence:**
- ERD showing relationships between Users, Vehicles, Trips, Maintenance, Issues, Parts, Inspections
- Architecture diagram showing four Next.js apps, one .NET API, one MySQL database
- Sequence diagrams for authentication flow

**Implementation Evidence:**
- Code showing UUID normalization approach
- Middleware implementation for role-based access
- API client showing data transformation layer

**Testing Evidence:**
- Cross-browser testing results
- API endpoint testing with Postman
- User acceptance testing with role-specific scenarios

**Leadership Reflections:**
- How you organized work across four separate codebases
- Decision-making process for technology choices
- How you balanced individual contributions with team goals

**Entrepreneurial Reflections:**
- Market opportunity for fleet management systems
- Competitive analysis of existing solutions
- Innovation in role-based application separation
- Scalability considerations for future growth

