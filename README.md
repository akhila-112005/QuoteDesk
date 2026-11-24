# Quote Desk

Quote Desk is a simple web application that helps users manage purchase requests (RFQs) and compare supplier quotations.

It helps identify the best supplier based on price, quotation validity and delivery time.

## Features

- Create and manage RFQs.
- Add supplier quotations with price, lead time and validity date.
- Edit and delete supplier quotations.
- Automatically calculate RFQ status as Open, Quoted or Expired.
- Highlight the best eligible quote based on price and delivery deadline.
- Store data in a database so it remains available after restarting the application.

## Technologies Used

- **Frontend:** React.js, CSS
- **Backend:** Python, Django, Django REST Framework
- **Database:** SQLite
- **Tools:** VS Code, Git

## How to Run

### 1. Start the Backend

Open a terminal and run:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
python -m pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000/`

### 2. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown in the terminal, usually `http://localhost:5173/`.

## Run Tests

To run the automated backend tests:

```bash
cd backend
python manage.py test
```

## If I Had One More Day

I would improve the application by adding user login, better form validation and more detailed supplier comparison features.

## Limitations

- User authentication is not included.
- The application is designed for local use.
- Email notifications and supplier communication are not implemented.

These features were left out to keep the project simple and focused on the main assignment requirements.