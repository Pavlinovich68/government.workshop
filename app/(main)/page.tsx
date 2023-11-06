/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {useSession} from "next-auth/react";
import {router} from "next/client";
import {useRouter} from "next/navigation";

const Dashboard = () => {
    const session = useSession();

    console.log('session:', session)

    return (
        <div className="grid">
            <div className="col-12 lg:col-6 xl:col-3">
                <div className="card mb-0">
                    <div className="flex justify-content-between mb-3">
                        <div>
                            <span className="block text-500 font-medium mb-3">{session.status} - {JSON.stringify(session.data?.user.password)}</span>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            {session.data && <img src={session.data?.user?.image??""} width={100} height={100} alt=""/>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
