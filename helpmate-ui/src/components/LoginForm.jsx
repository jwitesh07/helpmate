// // src/components/LoginForm.jsx

// import React, { useState } from 'react';

// const LoginForm = ({ onLoginSuccess, onToast }) => {
//   const [isLogin, setIsLogin] = useState(true);

//   const handleLoginSubmit = (e) => {
//     e.preventDefault();
//     const email = e.target.loginEmail.value;
//     const password = e.target.loginPassword.value;
    
//     if (email && password) {
//         onToast('Login successful! Welcome to HelpMate.');
//         setTimeout(onLoginSuccess, 1500);
//     }
//   };

//   const handleSignupSubmit = (e) => {
//     e.preventDefault();
//     const password = e.target.signupPassword.value;
//     const confirmPassword = e.target.confirmPassword.value;
    
//     if (password !== confirmPassword) {
//         onToast('Passwords do not match!');
//         return;
//     }
    
//     onToast('Account created successfully!');
//     setTimeout(onLoginSuccess, 1500);
//   };

//   const LogoIcon = () => (
//     <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M12 2C13.1 2 14 2.9 14 4V8L15.5 6.5C16.3 5.7 17.7 5.7 18.5 6.5C19.3 7.3 19.3 8.7 18.5 9.5L16 12H20C21.1 12 22 12.9 22 14C22 15.1 21.1 16 20 16H16L18.5 18.5C19.3 19.3 19.3 20.7 18.5 21.5C17.7 22.3 16.3 22.3 15.5 21.5L12 18V22C12 23.1 11.1 24 10 24C8.9 24 8 23.1 8 22V18L4.5 21.5C3.7 22.3 2.3 22.3 1.5 21.5C0.7 20.7 0.7 19.3 1.5 18.5L4 16H0C-1.1 16 -2 15.1 -2 14C-2 12.9 -1.1 12 0 12H4L1.5 9.5C0.7 8.7 0.7 7.3 1.5 6.5C2.3 5.7 3.7 5.7 4.5 6.5L8 10V4C8 2.9 8.9 2 10 2H12Z" fill="currentColor" transform="translate(2,0) scale(0.8)"/>
//     </svg>
//   );

//   return (
//     <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
//             <LogoIcon />
//           </div>
//           <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
//             Welcome to HelpMate
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Your trusted task companion platform
//           </p>
//         </div>
        
//         <div className="bg-white rounded-xl shadow-lg p-8">
//           <div className="mb-6">
//             <div className="flex rounded-lg bg-gray-100 p-1">
//               <button 
//                 onClick={() => setIsLogin(true)}
//                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
//               >
//                 Login
//               </button>
//               <button 
//                 onClick={() => setIsLogin(false)}
//                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
//               >
//                 Sign Up
//               </button>
//             </div>
//           </div>
          
//           {/* Login Form */}
//           {isLogin ? (
//             <form onSubmit={handleLoginSubmit} className="space-y-6">
//                 <div>
//                     <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">Email address</label>
//                     <input id="loginEmail" name="loginEmail" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter your email" />
//                 </div>
                
//                 <div>
//                     <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">Password</label>
//                     <input id="loginPassword" name="loginPassword" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter your password" />
//                 </div>
                
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                         <input id="rememberMe" name="remember-me" type="checkbox" className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
//                         <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">Remember me</label>
//                     </div>
//                     <div className="text-sm">
//                         <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">Forgot password?</a>
//                     </div>
//                 </div>
                
//                 <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
//                     Sign in
//                 </button>
//             </form>
//           ) : (
//             /* Signup Form */
//             <form onSubmit={handleSignupSubmit} className="space-y-6">
//                 <div className="grid grid-cols-2 gap-4">
//                     <div>
//                         <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
//                         <input id="firstName" name="firstName" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="First name" />
//                     </div>
//                     <div>
//                         <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
//                         <input id="lastName" name="lastName" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Last name" />
//                     </div>
//                 </div>
                
//                 <div>
//                     <label htmlFor="signupEmail" className="block text-sm font-medium text-gray-700">Email address</label>
//                     <input id="signupEmail" name="email" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter your email" />
//                 </div>
                
//                 <div>
//                     <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone number</label>
//                     <input id="phoneNumber" name="phone" type="tel" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="+91 98765 43210" />
//                 </div>
                
//                 <div>
//                     <label htmlFor="signupPassword" className="block text-sm font-medium text-gray-700">Password</label>
//                     <input id="signupPassword" name="signupPassword" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Create a password" />
//                 </div>
                
//                 <div>
//                     <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
//                     <input id="confirmPassword" name="confirmPassword" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Confirm your password" />
//                 </div>
                
//                 <div className="flex items-center">
//                     <input id="agreeTerms" name="agree-terms" type="checkbox" required className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
//                     <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900">
//                         I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-500">Terms and Conditions</a>
//                     </label>
//                 </div>
                
//                 <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
//                     Create account
//                 </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;