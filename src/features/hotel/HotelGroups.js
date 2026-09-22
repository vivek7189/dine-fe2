'use client';
import React from 'react';
import { FaLayerGroup } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import GroupsView from './components/GroupsView';

export default function HotelGroups() {
  return (
    <HotelShell icon={FaLayerGroup} title="Groups & Blocks"
      subtitle="Weddings, corporate offsites & tour allotments — block rooms, track pickup, manage the rooming list.">
      {(ctx) => <GroupsView {...ctx} />}
    </HotelShell>
  );
}
