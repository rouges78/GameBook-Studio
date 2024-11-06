"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const BookEditor = ({ bookData, setBookData }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookData((prev) => ({ ...prev, [name]: value }));
    };
    return (<div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Book Editor</h2>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input type="text" id="title" name="title" value={bookData.title} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"/>
      </div>
      <div className="mb-4">
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">
          Author
        </label>
        <input type="text" id="author" name="author" value={bookData.author} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"/>
      </div>
      {/* Add more fields and components for page editing */}
    </div>);
};
exports.default = BookEditor;
