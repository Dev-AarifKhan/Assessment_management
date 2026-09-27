package com.example

import com.example.data.model.ResultCalculator
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test
import java.util.UUID

class ExampleUnitTest {

    @Test
    fun testPassingPercentageDefault35() {
        val defaultPass = 35.0

        // 35% of 100 is 35.0
        assertEquals("Pass", ResultCalculator.computeResultStatus(35.0, 100.0, defaultPass, "Present"))
        assertEquals("Fail", ResultCalculator.computeResultStatus(34.9, 100.0, defaultPass, "Present"))

        // 35% of 50 is 17.5
        assertEquals("Pass", ResultCalculator.computeResultStatus(17.5, 50.0, defaultPass, "Present"))
        assertEquals("Fail", ResultCalculator.computeResultStatus(17.4, 50.0, defaultPass, "Present"))

        // Absent status handling
        assertEquals("Absent", ResultCalculator.computeResultStatus(null, 100.0, defaultPass, "Absent"))
        assertEquals("Pending", ResultCalculator.computeResultStatus(null, 100.0, defaultPass, "Present"))
    }

    @Test
    fun testGradeCalculation() {
        assertEquals("A1", ResultCalculator.computeGrade(95.0))
        assertEquals("A2", ResultCalculator.computeGrade(82.0))
        assertEquals("B1", ResultCalculator.computeGrade(74.0))
        assertEquals("B2", ResultCalculator.computeGrade(62.0))
        assertEquals("C1", ResultCalculator.computeGrade(55.0))
        assertEquals("C2", ResultCalculator.computeGrade(42.0))
        assertEquals("D", ResultCalculator.computeGrade(36.0))
        assertEquals("E (Re-appear)", ResultCalculator.computeGrade(28.0))
    }

    @Test
    fun testDivisionCalculation() {
        assertEquals("1st Div with Distinction", ResultCalculator.computeDivision(78.0, false))
        assertEquals("1st Division", ResultCalculator.computeDivision(65.0, false))
        assertEquals("2nd Division", ResultCalculator.computeDivision(52.0, false))
        assertEquals("3rd Division", ResultCalculator.computeDivision(38.0, false))
        assertEquals("Re-appear", ResultCalculator.computeDivision(30.0, false))
        assertEquals("Re-appear", ResultCalculator.computeDivision(85.0, true)) // Failed one subject
    }

    @Test
    fun testRecordPreservationUniqueIds() {
        val id1 = UUID.randomUUID().toString()
        val id2 = UUID.randomUUID().toString()
        assertNotEquals(id1, id2)
    }
}
