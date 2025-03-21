import { memo, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

export type OwnerAssignment = 'me' | 'partner' | 'us';

interface OwnerDropdownProps {
  onAssignedToChange: (assignedTo: OwnerAssignment) => void;
}

function OwnerDropdown({ onAssignedToChange }: OwnerDropdownProps) {
  const [assignedTo, setAssignedTo] = useState<OwnerAssignment>('us');
  const [owner, setOwner] = useState('Both of us');

  useEffect(() => {
    switch (assignedTo) {
      case 'us':
        setOwner('Both of us');
        break;
      case 'partner':
        setOwner('Partner');
        break;
      case 'me':
        setOwner('Me');
        break;
    }
    onAssignedToChange(assignedTo);
  }, [assignedTo]);

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
      <Text style={{ fontSize: 16, color: '#27272A' }}>Owner</Text>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <View
            style={{
              paddingVertical: 9,
              paddingHorizontal: 20,
              borderRadius: 20,
              width: 120,
              backgroundColor: '#F4F4F5',
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#8E51FF' }}>{owner}</Text>
          </View>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item
            key="me"
            onSelect={() => {
              onAssignedToChange('me');
              setAssignedTo('me');
            }}>
            <DropdownMenu.ItemTitle>Me</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="us"
            onSelect={() => {
              onAssignedToChange('us');
              setAssignedTo('us');
            }}>
            <DropdownMenu.ItemTitle>Both</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            key="partner"
            onSelect={() => {
              onAssignedToChange('partner');
              setAssignedTo('partner');
            }}>
            <DropdownMenu.ItemTitle>Partner</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </View>
  );
}

export default memo(OwnerDropdown);
