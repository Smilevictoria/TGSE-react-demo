import './App.css';
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

const daysOfWeek = ['已生成時間', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

function DraggableTime({ id , onDelete}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    // padding: '0.5rem 1rem',
    display: 'inline-block',
    margin: '0.5rem',
    backgroundColor: 'rgb(146, 166, 183)',
    color: 'white',
    borderRadius: '0.375rem',
    cursor: 'grab',
    whiteSpace: 'nowrap',
    padding: '0.3rem 0.6rem',
    fontSize: '1rem',
    position: 'relative', //closeStyle
  };

  const closeStyle = {
    position: 'absolute',
    top: '-7px',
    right: '-7px',
    backgroundColor: 'rgb(207, 158, 158)',
    borderRadius: '50%',
    width: '14px',
    height: '14px',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center',
    cursor: 'pointer',
  };


  // return (
  //   <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
  //     {id}
  //   </div>
  // );

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={closeStyle} onClick={(e) => {
        e.stopPropagation(); // 防止拖曳時誤點
        onDelete(id);
      }}>×</div>
      {/*僅這個文字部分可拖曳*/}
      <span {...listeners} style={{ cursor: 'grab' }}>
        {id}
      </span>
    </div>
  );
}

function DroppableColumn({ id, children }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const style = {
    minHeight: '120px',
    padding: '1rem',
    backgroundColor: isOver ? '#e0f2fe' : '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    width: '12rem',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{id}</div>
      {children}
    </div>
  );
}

export default function App() {
  const [inputTime, setInputTime] = useState('');
  const [itemsByDay, setItemsByDay] = useState({
    已生成時間: [],
    星期一: [],
    星期二: [],
    星期三: [],
    星期四: [],
    星期五: [],
    星期六: [],
    星期日: [],
  });

  const handleAddTime = () => {
    if (inputTime.trim() === '') return;
    setItemsByDay((prev) => ({
      ...prev,
      ['已生成時間']: [...prev['已生成時間'], inputTime],
    }));
    setInputTime('');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const sourceDay = Object.keys(itemsByDay).find((day) =>
      itemsByDay[day].includes(active.id)
    );

    if (!sourceDay) return;

    setItemsByDay((prev) => {
      const newItems = { ...prev };
      // 移除原本的位置
      newItems[sourceDay] = newItems[sourceDay].filter((item) => item !== active.id);
      // 新位置加入
      newItems[over.id] = [...newItems[over.id], active.id];
      return newItems;
    });
  };

  const handleDeleteTime = (id) => {
    setItemsByDay((prev) => {
      const newItems = {};
      for (const day in prev) {
        newItems[day] = prev[day].filter((item) => item !== id);
      }
      return newItems;
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>輸入工作的時間:</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="例如 09:00-10:00"
          value={inputTime}
          onChange={(e) => setInputTime(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #cbd5e1',
            borderRadius: '0.375rem',
            width: '200px',
          }}
        />
        <button
          onClick={handleAddTime}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          生成標籤
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/*「已生成時間」單獨一列 */}
      <div style={{ marginBottom: '2rem' }}>
        <DroppableColumn id="已生成時間">
          {itemsByDay['已生成時間'].map((item) => (
            <DraggableTime key={item} id={item} onDelete={handleDeleteTime}/>
          ))}
        </DroppableColumn>
      </div>

      {/* 星期們放一起 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {daysOfWeek
          .filter((day) => day !== '已生成時間')
          .map((day) => (
            <DroppableColumn key={day} id={day}>
              {itemsByDay[day].map((item) => (
                <DraggableTime key={item} id={item} onDelete={handleDeleteTime}/>
              ))}
            </DroppableColumn>
          ))}
      </div>
    </DndContext>
  </div>
  );
}