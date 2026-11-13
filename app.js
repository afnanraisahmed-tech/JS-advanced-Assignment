// ==========================================================
// JS Advanced Assignment — app.js
// All 10 questions live in this single file.
// Each solution is wrapped in its own { } block so that
// variable names never clash between questions.
// ==========================================================

// Q1: Create a function that takes an array of numbers and returns a new array where each number is squared. Use map method.
{
  const squareAll = (numbers) => numbers.map((n) => n * n);
  console.log(squareAll([1, 2, 3, 4, 5]));
}

// Q2: Write a function that takes an array of objects with name and age properties. Filter out only the users whose age is greater than 18.
{
  const users = [
    { name: "Ali", age: 22 },
    { name: "Sara", age: 17 },
    { name: "Bilal", age: 25 },
    { name: "Hina", age: 18 },
    { name: "Zara", age: 30 },
  ];

  const getAdults = (list) => list.filter((user) => user.age > 18);
  console.log(getAdults(users));
}

// Q3: Given an array of products with price, use reduce to calculate the total price of all products.
{
  const products = [
    { name: "Laptop", price: 1200 },
    { name: "Mouse", price: 25 },
    { name: "Keyboard", price: 75 },
    { name: "Monitor", price: 300 },
  ];

  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
  console.log(totalPrice);
}

// Q4: Create an array of students with marks. Sort the array in descending order based on marks.
{
  const students = [
    { name: "Ali", marks: 78 },
    { name: "Sara", marks: 92 },
    { name: "Bilal", marks: 65 },
    { name: "Hina", marks: 88 },
  ];

  const sortedStudents = [...students].sort((a, b) => b.marks - a.marks);
  console.log(sortedStudents);
}

// Q5: Write a function that takes an array of strings and finds the first string with length greater than 5 using find method.
{
  const words = ["cat", "sun", "javascript", "code", "elephant"];

  const firstLongWord = (list) => list.find((word) => word.length > 5);
  console.log(firstLongWord(words));
}

// Q6: Create an object named person with properties firstName, lastName and a method fullName that returns the full name using this keyword. Explain how this works in this context.
{
  const person = {
    firstName: "Ada",
    lastName: "Lovelace",
    fullName() {
      return this.firstName + " " + this.lastName;
    },
  };

  console.log(person.fullName());
  console.log(
    "Explanation: inside a method, 'this' points to the object the method was called on — here it is 'person'. " +
      "So this.firstName is person.firstName and this.lastName is person.lastName."
  );
}

// Q7: What will be the output of this code and why? Create an example to show the difference between regular function and arrow function when using this inside an object. (Use a property named "label", not "name", because window.name already exists.)
{
  const regularObj = {
    label: "Regular Function",
    show() {
      return this.label; // this = regularObj (the caller)
    },
  };

  const arrowObj = {
    label: "Arrow Function",
    show: () => this.label, // this = enclosing scope (window/global), NOT arrowObj
  };

  console.log("Regular function output:", regularObj.show());
  console.log("Arrow function output:", arrowObj.show());
  console.log(
    "Why: a regular function gets its own 'this' from HOW it is called (regularObj.show() => this = regularObj), " +
      "so it prints 'Regular Function'. An arrow function has NO own 'this' — it borrows 'this' from the scope " +
      "where it was defined (here the global scope), and window.label does not exist, so it prints undefined."
  );
}

// Q8: Write a function that takes an array of numbers, filters even numbers, then doubles them using map, and finally returns the sum of those doubled numbers using reduce. Do it in a chain.
{
  const sumOfDoubledEvens = (numbers) =>
    numbers
      .filter((n) => n % 2 === 0)
      .map((n) => n * 2)
      .reduce((sum, n) => sum + n, 0);

  console.log(sumOfDoubledEvens([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
}

// Q9: Create an array of employees with name, department and salary. Write code to: a) Find an employee who works in HR department b) Sort employees by salary in ascending order.
{
  const employees = [
    { name: "Ali", department: "HR", salary: 45000 },
    { name: "Sara", department: "Engineering", salary: 80000 },
    { name: "Bilal", department: "HR", salary: 52000 },
    { name: "Hina", department: "Design", salary: 60000 },
  ];

  const hrEmployee = employees.find((emp) => emp.department === "HR");
  console.log("HR employee:", hrEmployee);

  const sortedBySalary = [...employees].sort((a, b) => a.salary - b.salary);
  console.log(sortedBySalary);
}

// Q10: Create a function that takes an object and returns an array of its keys and values separately, then create a new object from an array of key-value pairs. Use Object.keys, Object.values, and Object.fromEntries.
{
  const splitObject = (obj) => ({
    keys: Object.keys(obj),
    values: Object.values(obj),
  });

  const source = { a: 1, b: 2, c: 3 };

  console.log(splitObject(source));

  const pairs = Object.entries(source);
  const rebuiltObject = Object.fromEntries(pairs);

  console.log(pairs);
  console.log(rebuiltObject);
}
