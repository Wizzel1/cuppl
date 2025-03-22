import { memo, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

export type OwnerAssignment = 'me' | 'partner' | 'us';

interface OwnerDropdownProps {
  onAssignedToChange: (assignedTo: OwnerAssignment) => void;
  selectedAssignedTo: OwnerAssignment;
}

function OwnerDropdown({ onAssignedToChange, selectedAssignedTo }: OwnerDropdownProps) {
  const [assignedTo, setAssignedTo] = useState<OwnerAssignment>(selectedAssignedTo);

  // Set initial owner text based on selectedAssignedTo
  const getOwnerText = (type: OwnerAssignment) => {
    switch (type) {
      case 'us':
        return 'Both of us';
      case 'partner':
        return 'Partner';
      case 'me':
        return 'Me';
      default:
        return 'Both of us';
    }
  };

  const [owner, setOwner] = useState(getOwnerText(selectedAssignedTo));

  useEffect(() => {
    setOwner(getOwnerText(assignedTo));
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
