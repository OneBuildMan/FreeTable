import React from 'react'
import logo from '../img/logo.png'
import signout from '../img/signout.png'
import { Link } from "react-router-dom"
import './css/button.css'
import './css/report.css'
import { useEffect, useState } from 'react'
import { firestore } from '../firebase'

export default function Dashboard() {
    const [reports, setReports] = useState([]);

    const fetchData = async () => {
        const reportCollection = await firestore.collection('reports').get()
        setReports(reportCollection.docs.map(doc => ({ ...doc.data(), id: doc.id})))
    };


    useEffect(() => {
        fetchData()
    }, [])

    const banUser = async (userName, reportId) => {
        if(window.confirm('Are you sure you want to ban this user? This will delete all his reviews')){
            const user = await firestore.collection('users').where("email", "==", userName).get()
            user.forEach(async (userDoc) => {
                const userId = userDoc.id
                await firestore.collection('users').doc(userId).update({
                banned: 'yes'
            })

            const restaurant = await firestore.collection('restaurants').get()
            restaurant.forEach(async (resDoc) => {
                const reviews = await resDoc.ref.collection('reviews').get()
                reviews.forEach(async (revDoc) => {
                    if(revDoc.data().userId === userName){
                        await revDoc.ref.delete()
                    }
                })
            })
        })
            await firestore.collection('reports').doc(reportId).delete()
            fetchData()
        }
    }

    const deleteReport = async(reportId) =>  {
        if(window.confirm('Are you sure you want to delete this report?')){
            await firestore.collection('reports').doc(reportId).delete()
        }

        fetchData()
    }

    return (
        <>
        <header>
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className='buttons'>
                <Link to='/admin' className='button'>All users</Link>
                <Link to='/reports' style={{ backgroundColor: 'red', color: 'white' }} className='button'>Reports</Link>
                <Link to='/login'><img src={signout} alt="signout" className='sign-out-btn'/></Link>
            </div>
        </header>
        <div className='reports'>
            <div className='report'>
                <h1>Reports</h1>
                <table className='report-table'>
                    <thead>
                        <tr>
                            <th>Reported user</th>
                            <th>Reporter</th>
                            <th>Reported review</th>
                            <th>Reason</th>
                            <th>Delete review</th>
                            <th>Ban user</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{report.reportedUser}</td>
                                <td>{report.reporter}</td>
                                <td>{report.review}</td>
                                <td>{report.text}</td>
                                <td><button onClick={() => deleteReport(report.id)}>Delete report</button></td>
                                <td><button onClick={() => banUser(report.reportedUser, report.id)}>Ban user</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    )
}