# AidFidelis Use Case Diagrams

## Figure 3.1: Grouped Use Case Diagram

```mermaid
flowchart LR
    User([User])
    Pharmacy([Pharmacy])
    Rider([Rider])
    Admin([Administrator])

    subgraph System["AidFidelis System"]
        U((User Services))
        P((Pharmacy Services))
        R((Rider Services))
        A((Administration))
    end

    User --> U
    Pharmacy --> P
    Rider --> R
    Admin --> A
```

## Figure 3.2: User Use Case Flow

```mermaid
flowchart TD
    A([Start]) --> B[Register or Log In]
    B --> C[View User Dashboard]
    C --> D[Browse or Search Medicines]
    D --> E[View Medicine Details]
    E --> F[Add Medicine to Cart]
    F --> G[Review Cart]
    G --> H{Proceed with Order?}
    H -- No --> D
    H -- Yes --> I[Enter Delivery Details]
    I --> J[Make Payment]
    J --> K{Payment Successful?}
    K -- No --> J
    K -- Yes --> L[Order Confirmed]
    L --> M[View Order Status]
    M --> N[Track Delivery]
    N --> O[Receive Medicine]
    O --> P([Stop])
```

## Figure 3.3: Pharmacy Use Case Flow

```mermaid
flowchart TD
    A([Start]) --> B[Register Pharmacy]
    B --> C{Registration Approved?}
    C -- No --> D[Correct or Resubmit Details]
    D --> B
    C -- Yes --> E[Log In to Pharmacy Dashboard]
    E --> F[Manage Pharmacy Profile]
    F --> G[Add or Update Medicines]
    G --> H[Update Medicine Availability]
    H --> I[Receive Customer Order]
    I --> J[Review Order Details]
    J --> K{Medicine Available?}
    K -- No --> L[Update Availability or Notify System]
    L --> I
    K -- Yes --> M[Accept and Process Order]
    M --> N[Prepare Order for Dispatch]
    N --> O[Send Order to Rider or Warehouse]
    O --> P[Monitor Order Progress]
    P --> Q([Stop])
```

## Figure 3.4: Rider Use Case Flow

```mermaid
flowchart TD
    A([Start]) --> B[Log In to Rider Dashboard]
    B --> C[View Assigned Deliveries]
    C --> D[Select Delivery Order]
    D --> E[View Customer and Order Details]
    E --> F[Collect Medicine from Pharmacy or Warehouse]
    F --> G[Update Status: Picked Up]
    G --> H[Travel to Delivery Location]
    H --> I[Update Status: Out for Delivery]
    I --> J[Contact or Locate Customer]
    J --> K{Customer Available?}
    K -- No --> L[Report Failed Delivery Attempt]
    L --> M[Update Delivery Status]
    M --> N([Stop])
    K -- Yes --> O[Hand Over Medicine]
    O --> P[Confirm Delivery]
    P --> Q[Update Status: Delivered]
    Q --> R([Stop])
```

## Figure 3.5: Administrator Use Case Flow

```mermaid
flowchart TD
    A([Start]) --> B[Log In to Admin Dashboard]
    B --> C[View System Overview]
    C --> D[Review Pharmacy Registrations]
    D --> E{Approve Pharmacy?}
    E -- No --> F[Reject or Request Correction]
    F --> D
    E -- Yes --> G[Approve Pharmacy Account]
    G --> H[Manage Users and Roles]
    H --> I[Manage Medicines]
    I --> J[Manage Riders and Warehouse Personnel]
    J --> K[Manage Orders and Deliveries]
    K --> L[Manage Approved Medication Rules]
    L --> M[Review System Activities]
    M --> N[View Reports]
    N --> O[Log Out]
    O --> P([Stop])
```

## Figure Captions

- **Figure 3.1:** Grouped Use Case Diagram of the AidFidelis System
- **Figure 3.2:** User Use Case Flow
- **Figure 3.3:** Pharmacy Use Case Flow
- **Figure 3.4:** Rider Use Case Flow
- **Figure 3.5:** Administrator Use Case Flow

## How to Export the Diagrams

Open this file in a Mermaid-compatible Markdown preview. In Visual Studio Code, install a Mermaid diagram preview extension, open the Markdown preview, and export or capture each diagram for insertion into Microsoft Word. The diagrams can also be recreated in draw.io using the same steps and labels.
