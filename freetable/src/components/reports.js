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

    const deleteReview = async (reportId, resId, reviewId) => {
        if(window.confirm('Are you sure you want to delete this review?')){
        
        await firestore.collection('restaurants').doc(resId).collection('reviews').doc(reviewId).delete()
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
                            <th>Delete report</th>
                            <th>Delete review</th>
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
                                <td><button onClick={() => deleteReview(report.id, report.restaurantId, report.reviewId)}>Delete review</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    )
}