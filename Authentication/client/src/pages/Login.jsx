import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {

    const {backendUrl,setIsLoggedIn,getUserData} = useContext(AppContext)

    const [state,setSate] = useState('Login')
    const [name,setName] = useState('')
    const [email,setEmail] = useState('')
    const [password,setpassword] = useState('')

    const navigate = useNavigate()

    const onSubmitHandler = async (e)=>{
        try{
            e.preventDefault()

            axios.defaults.withCredentials = true  // always send cookies (or other credentials like authorization headers) with requests.

            if(state === 'Sign Up'){
                const {data} = await axios.post(backendUrl+"/api/auth/register",{name,email,password}) // response

                if(data.success){     // success --> backend server
                    setIsLoggedIn(true)
                    getUserData()
                    navigate('/')
                }else{
                    toast.error(data.message)
                }

            }else{
                const {data} = await axios.post(backendUrl+"/api/auth/login",{email,password})

                if(data.success){
                    setIsLoggedIn(true)
                    getUserData()
                    navigate('/')
                }else{
                    toast.error(data.message)
                }
            }
        }catch(err){
            toast.error(err.message)
        }
    }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
        <img onClick={()=>navigate('/')} src={assets.logo} alt="" className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
        <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
            <h2 className='text-3xl font-semibold text-white text-center'>{state === 'Sign Up'?'Create Account':'Login'}</h2>
            <p className='text-center text-sm mb-6'>{state === 'Sign Up'?'Create your account':'Login to your account!'}</p>

            <form onSubmit={onSubmitHandler}>
                {state === 'Sign Up' && (
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.person_icon} alt="" />
                        <input onChange={(e)=>setName(e.target.value)} value={name} className='bg-transparent outline-none text-gray-50' type="text" placeholder='Full Name' required/>
                    </div>
                )}
                
                <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                    <img src={assets.mail_icon} alt="" />
                    <input onChange={(e)=>setEmail(e.target.value)} value={email} className='bg-transparent outline-none text-gray-50' type="email" placeholder='Email' required/>
                </div>
                <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                    <img src={assets.lock_icon} alt="" />
                    <input onChange={(e)=>setpassword(e.target.value)} value={password} className='bg-transparent outline-none text-gray-50' type="password" placeholder='Passsword' required/>
                </div>

                <p onClick={()=>navigate('/reset-password')} className='mb-4 text-indigo-500 cursor-pointer hover:text-indigo-300'>forgot password</p>

                <button type='submit' className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 font-medium text-gray-200 cursor-pointer'>{state}</button>
            </form>
            {state === 'Sign Up' ? (
                <p className='text-gray-400 text-center text-xs mt-4'>Already have an account?{' '}
                    <span onClick={()=>setSate("Login")} className='text-blue-400 cursor-pointer underline'>Login here</span>
                </p>
            ) : (
                <p className='text-gray-400 text-center text-xs mt-4'>Don't have an account?{' '}
                    <span onClick={()=>setSate("Sign Up")} className='text-blue-400 cursor-pointer underline'>Sign up</span>
                </p>    
            )}
            
        </div>
    </div>
  )
}

export default Login