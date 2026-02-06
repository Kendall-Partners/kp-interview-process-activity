# kp-interview-process-activity
This project is a **small, local Flask application** designed to visualize **real-estate cashflow over time** using a fixed dataset.

You will build a simple interface that helps a user understand **cash in vs cash out across the lifecycle of real-estate transactions**.

The goal is **clarity and correctness**, not polish.

---

## Branching Instructions (Required)

Before writing any code:

1. Create a new branch off `main`
2. Use the following naming convention:

```bash
feature/{firstname}-{lastname}
```

**Example:**

```bash
feature/john-doe
```

All work must be done on this branch.

---

## Project Constraints

You **must use only** the following files for your implementation:

- `routes.py`
- `templates/index.html`
- `static/script.js`
- `static/styles.css`

You **should not**:
- Add new backend frameworks
- Add databases
- Add frontend libraries (React, Vue, Chart.js, etc.)
- Modify the data format

Vanilla Flask + vanilla JavaScript only.

---

## Data & Cashflow Rules

You will be working with real-estate transaction data loaded from:

```
data/records.json
```

Each record represents a single property transaction.

### Cashflow assumptions (important)

Use the following rules **exactly**:

1. **Purchase Date**
   - `purchase_price` is **cash out**

2. **List Date**
   - `rehab_expense` is **cash out**

3. **Sale Date**
   - `sale_price` is **cash in**

---

## Cashflow Over Time

Your interface should help the user understand:

- How cashflow evolves over time
- When capital is deployed vs returned

You may choose to represent time as:
- Individual events
- Daily aggregation
- Monthly aggregation

There is no single “correct” visualization — make a reasonable choice and be consistent.

---

## Application Requirements

### Backend (`routes.py`)

- Serve the home page at `/`
- Expose at least one API endpoint that returns the raw JSON data
- Server-side calculations are **not required**, but allowed

---

### Frontend (`index.html`, `script.js`, `styles.css`)

- Fetch data from the backend API
- Convert records into cashflow events
- Display cashflow **over time**
- Clearly distinguish:
  - Cash in
  - Cash out

The UI should be understandable without explanation.

**Examples of acceptable visualizations:**
- Date-ordered table
- Timeline of cashflow events
- Running total over time
- Simple bar or list-based view

You **CAN** use external charting libraries.

---

## Setup & Running the App

### 1. Clone the repository

```bash
git clone <repo-url>
cd <repo-name>
```

### 2. Create and activate the virtual environment

```bash
./setup.sh
source .venv/bin/activate
```

### 3. Start the Flask app

```bash
python routes.py
```

### 4. Open in your browser

```
http://127.0.0.1:5001
```

---

## Basic Project Structure

```
kp-interview-process-activity/
├── README.md
├── app/
│   ├── routes.py
│   ├── static/
│   │   ├── script.js
│   │   └── styles.css
│   └── templates/
│       └── index.html
├── code/
│   ├── requirements.txt
│   └── setup.sh
└── data/
    └── records.json

```

---

## Submission Instructions (Required)

When finished:

1. Commit all changes to your feature branch
2. Push your branch to GitHub

```bash
git push origin feature/{firstname}-{lastname}
```

3. Create a **Pull Request** targeting the `main` branch
4. In the PR description, briefly explain:
   - How you modeled cashflow over time
   - Any assumptions or tradeoffs you made

---

## What We’re Evaluating

We are **not** looking for perfection.

We care about:
- Correct interpretation of the cashflow rules
- Clear data → UI flow
- Readable, intentional code
- Ability to translate raw data into insight

If you have any questions or have any follow up please email me at joey@kendallpartnersltd.com

